# FHEVM Rock-Paper-Scissors Hardhat - Technical Reference

## Overview

The `fhevm-rock-paper-scissors-hardhat` package includes several custom Hardhat tasks to interact with the FHEVM
Rock-Paper-Scissors smart contracts.

All tasks can run on localhost or testnets with `--network` as long as they are supported.

## Technical Reference

[`task:factory-address`](#taskfactory-address)  
[`task:create-game`](#taskcreate-game)  
[`task:games`](#taskgames)  
[`task:game-count`](#taskgame-count)  
[`task:game-info`](#taskgame-info)  
[`task:play`](#taskplay)  
[`task:compute-winner`](#taskcompute-winner)

### `task:factory-address`

Returns the deployed `FHERockPaperScissorsFactory` address.

#### Example:

```bash
npx hardhat --network sepolia task:factory-address
```

### `task:create-game`

Deploys a new `FHERockPaperScissors` contract from the factory.

#### Example

```bash
npx hardhat --network sepolia task:create-game [--address 0x...]
```

#### Arguments

- `address`  
  Address of the factory contract. Optional.

### `task:games`

Returns a paginated list of the games deployed by the factory contract.

#### Example

```bash
npx hardhat --network sepolia task:games --page 1 --pagesize 10 [--address 0x...]
```

#### Arguments

- `page`  
  Page number (page > 0).

- `pagesize`  
  Number of results per page (0 < pageSize ≤ 10).

- `address`  
  Address of the factory contract. Optional.

### `task:game-count`

Returns the number of games deployed by the factory contract.

#### Example

```bash
npx hardhat --network sepolia task:game-count [--address 0x...]
```

#### Arguments

- `address`  
  Address of the factory contract. Optional.

### `task:game-info`

Returns the information of a specific game.

#### Example

```bash
npx hardhat --network sepolia task:game-info --address 0x...
```

#### Arguments

- `address`  
  Address of the target game contract.

### `task:play`

Submits an encrypted gesture for the connected player in a given game.

#### Example

```bash
npx hardhat --network sepolia task:play --address 0x... --gesture 0 --signerindex 0
```

#### Arguments

- `address`  
  Address of the target game contract.

- `gesture`  
  Gesture played (`Rock=0`, `Paper=1`, `Scissors=2`).

- `signerindex`  
  Index of the Hardhat signer used to play.

### `task:compute-winner`

Requests the computation of the winner for a given completed game.

#### Example

```bash
npx hardhat --network sepolia task:compute-winner --address 0x...
```

#### Arguments

- `address`  
  Address of the target game contract.
