// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHERockPaperScissors is SepoliaConfig {
    enum State {
        WaitingForPlayers,
        PlayerOnePlayed,
        PlayerTwoPlayed,
        WaitingForWinner,
        Resolved
    }

    State public state;
    address public player1;
    address public player2;
    euint8 public gesture1;
    euint8 public gesture2;
    address public winnerAddress;

    uint256 private _decryptionRequestId;

    event WaitingForPlayers();
    event PlayerOnePlayed(address indexed player1, euint8 gesture);
    event PlayerTwoPlayed(address indexed player2, euint8 gesture);
    event WaitingForWinner();
    event Resolved(address indexed winnerAddress);

    constructor() {
        state = State.WaitingForPlayers;
        emit WaitingForPlayers();
    }

    function getGame() public view returns (State, address, address, euint8, euint8, address) {
        return (state, player1, player2, gesture1, gesture2, winnerAddress);
    }

    function play(externalEuint8 encryptedGesture, bytes calldata inputProof) public {
        euint8 gesture = FHE.fromExternal(encryptedGesture, inputProof);

        if (player1 == address(0)) {
            player1 = msg.sender;
            gesture1 = gesture;
            FHE.allowThis(gesture1);
            state = State.PlayerOnePlayed;
            emit PlayerOnePlayed(msg.sender, gesture);
        } else if (player2 == address(0)) {
            require(msg.sender != player1, "Cannot play against yourself");
            player2 = msg.sender;
            gesture2 = gesture;
            FHE.allowThis(gesture2);
            state = State.PlayerTwoPlayed;
            emit PlayerTwoPlayed(msg.sender, gesture);
        } else {
            require(false, "Game already finished");
        }
    }

    function computeWinner() public {
        require(state != State.Resolved, "Winner already computed");
        require(state != State.WaitingForWinner, "Already waiting for winner");
        require(state == State.PlayerTwoPlayed, "Game not finished yet");

        // outcome = (3 + gesture1 - gesture2) % 3
        // outcome == 0 => draw
        // outcome == 1 => player1 wins
        // outcome == 2 => player2 wins
        euint8 encryptedOutcome = FHE.rem(FHE.add(FHE.asEuint8(3), FHE.sub(gesture1, gesture2)), 3);

        bytes32[] memory cypherTexts = new bytes32[](1);
        cypherTexts[0] = FHE.toBytes32(encryptedOutcome);
        _decryptionRequestId = FHE.requestDecryption(cypherTexts, this.resolveGameCallback.selector);

        state = State.WaitingForWinner;
        emit WaitingForWinner();
    }

    function resolveGameCallback(uint256 requestId, bytes memory cleartexts, bytes memory decryptionProof) public {
        require(state == State.WaitingForWinner, "No winner computation requested");
        require(requestId == _decryptionRequestId, "Invalid requestId");

        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        uint8 decryptedOutcome = abi.decode(cleartexts, (uint8));

        winnerAddress = decryptedOutcome == 1 ? player1 : (decryptedOutcome == 2 ? player2 : address(0));
        state = State.Resolved;
        emit Resolved(winnerAddress);
    }
}
