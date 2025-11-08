// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHERockPaperScissors} from "./FHERockPaperScissors.sol";

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

    /// @notice Error thrown when the page number is less than or equal to 0
    error PageMustBeGreaterThan0();

    /// @notice Error thrown when the page size is less than or equal to 0 or greater than 10
    error PageSizeMustBeGreaterThan0AndLessThanOrEqualTo10();

    /// @notice Error thrown when the page is out of bounds
    error PageOutOfBounds();

    /// @notice Deploys a new FHE Rock-Paper-Scissors game
    /// @return The newly created game contract
    function deployGame() public returns (FHERockPaperScissors) {
        FHERockPaperScissors game = new FHERockPaperScissors();

        games.push(address(game));
        ++gameCount;

        emit GameCreated(address(game), msg.sender);
        return game;
    }

    /// @notice Returns a paginated list of deployed game addresses
    /// @param page Page number to retrieve (starts at 1)
    /// @param pageSize Number of game addresses per page (max 10)
    /// @return An array of game addresses for the specified page
    function getPaginatedGames(uint256 page, uint256 pageSize) public view returns (address[] memory) {
        if (page == 0) revert PageMustBeGreaterThan0();
        if (pageSize == 0 || pageSize > 10) revert PageSizeMustBeGreaterThan0AndLessThanOrEqualTo10();

        uint256 start = (page - 1) * pageSize;
        uint256 end = start + pageSize;
        if (end > gameCount) {
            end = gameCount;
        }
        if (start > end) revert PageOutOfBounds();
        uint256 length = end - start;

        address[] memory paginatedGames = new address[](length);
        for (uint256 i = 0; i < length; ++i) {
            paginatedGames[i] = games[start + i];
        }
        return paginatedGames;
    }
}
