# FHEVM Rock-Paper-Scissors Hardhat - Quick Start

This tutorial guides you through deploying and interacting with the FHEVM Rock-Paper-Scissors smart contracts via
Hardhat tasks. You'll learn how to deploy the factory contract, create or join games, submit encrypted gestures, and
resolve matches using fully homomorphic encryption on Ethereum.

For more detailed information, see the
[Rock-Paper-Scissors Hardhat Technical Reference](hardhat-technical-reference.md).

## Prerequisites

Complete the [configuration](../README.md#configuration) step in the [README.md](../README.md) file of the monorepo.

For this guide, start from the **root folder** of the monorepo.

## Install

First, you need to install the package dependencies.

```bash
pnpm install
```

## Compilation

Compile the smart contracts.

```bash
pnpm hardhat:compile
```

The TypeChain types are generated automatically after compilation and can be found at `packages/sdk/src/types/`

## Deployment

Deploy the factory contract that will manage Rock-Paper-Scissors games.

### Local network

Start a local node in one terminal.

```bash
pnpm hardhat:chain
```

Deploy the factory contract in another terminal.

```bash
pnpm hardhat:deploy
```

### Sepolia testnet

Deploy to Sepolia.

```bash
pnpm hardhat:deploy:sepolia
```

## Steps

Now that the contracts are compiled and deployed, navigate to the `/packages/hardhat/` directory. All the following
tasks must be executed from this folder.

```bash
cd packages/hardhat
```

### 1. Check the factory contract address

To confirm that the factory was deployed correctly, retrieve its address by executing the
[`task:factory-address`](./hardhat-technical-reference.md#taskfactory-address) task.

```bash
npx hardhat --network sepolia task:factory-address
```

### 2. Create a new game

Create a new Rock-Paper-Scissors game with the [`task:create-game`](./hardhat-technical-reference.md#taskcreate-game)
task. The Hardhat signer must have enough funds to cover the deployment cost of the new game contract.

```bash
npx hardhat --network sepolia task:create-game
```

Once the transaction is executed, the task will display the address of the deployed game contract. Take note as you will
need it later.

### 3. List the existing games

List existing games deployed by the factory with the [`task:games`](./hardhat-technical-reference.md#taskgames) task and
paginate the results by specifying `--page` and `--pagesize`.

```bash
npx hardhat --network sepolia task:games --page 1 --pagesize 10
```

### 4. Get the total number of existing games

Check the total number of created games by running the
[`task:game-count`](./hardhat-technical-reference.md#taskgame-count) task.

```bash
npx hardhat --network sepolia task:game-count
```

### 5. Get the game information

Execute the [`task:game-info`](./hardhat-technical-reference.md#taskgame-info) task with the `--address` argument set to
the address of your game to get its information. This includes the addresses of the two players, their encrypted played
gestures, and the winner. If the players, gestures, or winner are not set, they will be the zero address or zero hash
until they are.

```bash
npx hardhat --network sepolia task:game-info --address 0x...
```

### 6. Play with first player

To participate in a game, the first player must submit their encrypted gesture using the
[`task:play`](./hardhat-technical-reference.md#taskplay) task. Set the `--address` argument as the address of the game,
the `--gesture` to one of the available options (0=Rock, 1=Paper, 2=Scissors) and the `--signerindex` to the Hardhat
signer that will play.

```bash
npx hardhat --network sepolia task:play --address 0x... --gesture 0 --signerindex 0
```

After execution, run the [`task:game-info`](./hardhat-technical-reference.md#taskgame-info) task again to verify that
the state has changed to `PlayerOnePlayed`, and the encrypted gesture is stored onchain.

### 7. Play with second player

Repeat the process with a different `--signerindex` to select the signer of the second player participating.

```bash
npx hardhat --network sepolia task:play --address 0x... --gesture 1 --signerindex 1
```

Execute the [`task:game-info`](./hardhat-technical-reference.md#taskgame-info) task one more time to see how the state
changed to `PlayerTwoPlayed`. At this point, both gestures are encrypted onchain and only the winner computation
remains.

### 8. Check the winner

To determine the winner of the game, execute the
[`task:compute-winner`](./hardhat-technical-reference.md#taskcompute-winner) task with the `--address` argument as the
address of the game.

```bash
npx hardhat --network sepolia task:compute-winner --address 0x...
```

Once the winner computation is requested, the state of the game will change to `WaitingForWinner`.

A few seconds or minutes after the transaction to request the winner is executed, the state of the game will change to
`Resolved` and the `winnerAddress` will be set to the address of the winner. In case of a draw, the zero address will be
set as the winner.

## Recap

You have now successfully deployed, played, and resolved a FHEVM Rock-Paper-Scissors game using Hardhat tasks.

Check the [SDK Quick Start](./sdk-quick-start.md) to learn how to interact with the Rock-Paper-Scissors contracts using
the TypeScript SDK.
