// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHERockPaperScissors} from "./FHERockPaperScissors.sol";
import {externalEuint8} from "@fhevm/solidity/lib/FHE.sol";

contract FHERockPaperScissorsFactory {
    uint256 public gameCount;
    address[] public games;

    event GameCreated(address indexed gameAddress, address indexed creatorAddress);

    function deployGame() public returns (uint256) {
        FHERockPaperScissors game = new FHERockPaperScissors();

        games.push(address(game));
        gameCount++;

        emit GameCreated(address(game), msg.sender);
        return gameCount - 1;
    }

    function getPaginatedGames(uint256 page, uint256 pageSize) public view returns (address[] memory) {
        require(page > 0, "Page must be greater than 0");
        require(pageSize > 0 && pageSize <= 10, "Page size must be greater than 0 and less than or equal to 10");

        uint256 start = (page - 1) * pageSize;
        uint256 end = start + pageSize;
        if (end > gameCount) {
            end = gameCount;
        }
        require(start <= end, "Page out of bounds");
        uint256 length = end - start;

        address[] memory paginatedGames = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            paginatedGames[i] = games[start + i];
        }
        return paginatedGames;
    }
}
