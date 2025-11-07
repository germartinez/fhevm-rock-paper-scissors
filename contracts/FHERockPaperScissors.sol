// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHERockPaperScissors is SepoliaConfig {
    enum State {
        WaitingForPlayers,
        PlayerOnePlayed,
        PlayerTwoPlayed
    }

    State public state;
    address public player1;
    address public player2;
    euint8 public gesture1;
    euint8 public gesture2;

    event WaitingForPlayers();
    event PlayerOnePlayed(address indexed player1, euint8 gesture);
    event PlayerTwoPlayed(address indexed player2, euint8 gesture);

    constructor() {
        state = State.WaitingForPlayers;
        emit WaitingForPlayers();
    }

    function getGame() public view returns (State, address, address, euint8, euint8) {
        return (state, player1, player2, gesture1, gesture2);
    }

    function play(externalEuint8 encryptedGesture, bytes calldata inputProof) public {
        euint8 gesture = FHE.fromExternal(encryptedGesture, inputProof);

        if (player1 == address(0)) {
            player1 = msg.sender;
            gesture1 = gesture;
            state = State.PlayerOnePlayed;
            emit PlayerOnePlayed(msg.sender, gesture);
        } else if (player2 == address(0)) {
            require(msg.sender != player1, "Cannot play against yourself");
            player2 = msg.sender;
            gesture2 = gesture;
            state = State.PlayerTwoPlayed;
            emit PlayerTwoPlayed(msg.sender, gesture);
        } else {
            require(false, "Game already finished");
        }
    }
}
