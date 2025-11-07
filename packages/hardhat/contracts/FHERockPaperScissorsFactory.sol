// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHERockPaperScissors} from "./FHERockPaperScissors.sol";
import {externalEuint8} from "@fhevm/solidity/lib/FHE.sol";

/// @title Fully Homomorphic Encryption Rock-Paper-Scissors Factory
/// @author Germán Martínez
/// @notice This contract deploys and tracks FHE Rock-Paper-Scissors games
contract FHERockPaperScissorsFactory {
    /// @notice Total number of deployed games
    uint256 public gameCount;

    /// @notice Addresses of all deployed games
    address[] public games;

    /// @notice Emitted when a new game is deployed
    /// @param gameAddress Address of the newly created game contract
    /// @param creatorAddress Address of the account who deployed the game
    event GameCreated(address indexed gameAddress, address indexed creatorAddress);

    /// @notice Deploys a new FHE Rock-Paper-Scissors game
    /// @return The newly created game contract
    function deployGame() public returns (FHERockPaperScissors) {
        FHERockPaperScissors game = new FHERockPaperScissors();

        games.push(address(game));
        gameCount++;

        emit GameCreated(address(game), msg.sender);
        return game;
    }

    /// @notice Returns a paginated list of deployed game addresses
    /// @param page Page number to retrieve (starts at 1)
    /// @param pageSize Number of game addresses per page (max 10)
    /// @return An array of game addresses for the specified page
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
