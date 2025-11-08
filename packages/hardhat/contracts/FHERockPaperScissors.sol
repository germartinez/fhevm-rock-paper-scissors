// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Fully Homomorphic Encryption Rock-Paper-Scissors
/// @author Germán Martínez
/// @notice This contract enables two players to play Rock-Paper-Scissors privately using FHEVM
/// @dev The contract uses Zama's Sepolia configuration for FHE operations and asynchronous decryption callbacks
contract FHERockPaperScissors is SepoliaConfig {
    /// @notice Game states lifecycle
    enum State {
        WaitingForPlayers,
        PlayerOnePlayed,
        PlayerTwoPlayed,
        WaitingForWinner,
        Resolved
    }

    /// @notice Current state of the game
    State public state;

    /// @notice Address of the first player
    address public player1;

    /// @notice Address of the second player
    address public player2;

    /// @notice Encrypted gesture of the first player
    euint8 public gesture1;

    /// @notice Encrypted gesture of the second player
    euint8 public gesture2;

    /// @notice Address of the winner
    address public winnerAddress;

    /// @notice Latest decryption request identifier
    uint256 private _decryptionRequestId;

    /// @notice Emitted when the game is initialized and waiting for players
    event WaitingForPlayers();

    /// @notice Emitted when the first player makes a move
    /// @param player1 Address of the first player
    /// @param gesture Encrypted gesture of the first player
    event PlayerOnePlayed(address indexed player1, euint8 gesture);

    /// @notice Emitted when the second player makes a move
    /// @param player2 Address of the second player
    /// @param gesture Encrypted gesture of the second player
    event PlayerTwoPlayed(address indexed player2, euint8 gesture);

    /// @notice Emitted when the contract requests decryption to compute the winner
    event WaitingForWinner();

    /// @notice Emitted when the game is resolved and a winner is determined
    /// @param winnerAddress Address of the winner (zero address if draw)
    event Resolved(address indexed winnerAddress);

    /// @notice Error thrown when a player tries to play against themselves
    error CannotPlayAgainstYourself();

    /// @notice Error thrown when the game is not finished yet
    error GameNotFinished();

    /// @notice Error thrown when the game is already finished
    error GameAlreadyFinished();

    /// @notice Error thrown when the game is not finished yet
    error AlreadyWaitingForWinner();

    /// @notice Error thrown when the winner is already computed
    error WinnerAlreadyComputed();

    /// @notice Error thrown when no winner computation is requested
    error NoWinnerComputationRequested();

    /// @notice Error thrown when the request ID is invalid
    error InvalidRequestId();

    /// @notice Initializes a new Rock-Paper-Scissors game in the waiting state
    constructor() {
        state = State.WaitingForPlayers;
        emit WaitingForPlayers();
    }

    /// @notice Returns the complete game state
    /// @return state Current state
    /// @return player1 Address of the first player
    /// @return player2 Address of the second player
    /// @return gesture1 Encrypted gesture of the first player
    /// @return gesture2 Encrypted gesture of the second player
    /// @return winnerAddress Address of the winner (zero address if draw)
    function getGame() public view returns (State, address, address, euint8, euint8, address) {
        return (state, player1, player2, gesture1, gesture2, winnerAddress);
    }

    /// @notice Submits an encrypted gesture for the calling player
    /// @dev Only two unique players can play per game
    /// @param encryptedGesture Player's encrypted move (Rock=0, Paper=1, Scissors=2)
    /// @param inputProof Proof verifying encryption validity
    function play(externalEuint8 encryptedGesture, bytes calldata inputProof) public {
        euint8 gesture = FHE.fromExternal(encryptedGesture, inputProof);

        if (player1 == address(0)) {
            player1 = msg.sender;
            gesture1 = gesture;
            FHE.allowThis(gesture1);
            state = State.PlayerOnePlayed;
            emit PlayerOnePlayed(msg.sender, gesture);
        } else if (player2 == address(0)) {
            if (msg.sender == player1) revert CannotPlayAgainstYourself();
            player2 = msg.sender;
            gesture2 = gesture;
            FHE.allowThis(gesture2);
            state = State.PlayerTwoPlayed;
            emit PlayerTwoPlayed(msg.sender, gesture);
        } else {
            revert GameAlreadyFinished();
        }
    }

    /// @notice Requests decryption to determine the game winner
    /// @dev The encrypted outcome is computed and submitted for asynchronous decryption
    /// The outcome formula is: (3 + gesture1 - gesture2) % 3
    /// - 0 => Draw
    /// - 1 => The first player wins
    /// - 2 => The second player wins
    function computeWinner() public {
        if (state == State.Resolved) revert WinnerAlreadyComputed();
        if (state == State.WaitingForWinner) revert AlreadyWaitingForWinner();
        if (state != State.PlayerTwoPlayed) revert GameNotFinished();

        euint8 encryptedOutcome = FHE.rem(FHE.add(FHE.asEuint8(3), FHE.sub(gesture1, gesture2)), 3);

        bytes32[] memory cypherTexts = new bytes32[](1);
        cypherTexts[0] = FHE.toBytes32(encryptedOutcome);
        _decryptionRequestId = FHE.requestDecryption(cypherTexts, this.resolveGameCallback.selector);

        state = State.WaitingForWinner;
        emit WaitingForWinner();
    }

    /// @notice Callback executed when the decryption of the winner is returned
    /// @dev Verifies signatures and finalizes game resolution
    /// @param requestId ID of the matching decryption request
    /// @param cleartexts Decrypted plaintext result
    /// @param decryptionProof Proof of correct decryption
    function resolveGameCallback(uint256 requestId, bytes memory cleartexts, bytes memory decryptionProof) public {
        if (state != State.WaitingForWinner) revert NoWinnerComputationRequested();
        if (requestId != _decryptionRequestId) revert InvalidRequestId();

        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        uint8 decryptedOutcome = abi.decode(cleartexts, (uint8));

        winnerAddress = decryptedOutcome == 1 ? player1 : (decryptedOutcome == 2 ? player2 : address(0));
        state = State.Resolved;
        emit Resolved(winnerAddress);
    }
}
