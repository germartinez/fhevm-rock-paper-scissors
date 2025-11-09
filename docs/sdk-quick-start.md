# FHEVM Rock-Paper-Scissors SDK - Quick Start

This tutorial guides you through deploying and interacting with the FHEVM Rock-Paper-Scissors smart contracts via the
`fhevm-rock-paper-scissors` TypeScript SDK. You'll learn how to create or join games, submit encrypted gestures, and
resolve matches using fully homomorphic encryption on Ethereum.

For more detailed information, see the [Rock-Paper-Scissors SDK Technical Reference](sdk-technical-reference.md).

## Prerequisites

Ensure your signers are connected to a supported network. Currently, only **Sepolia** is supported.

## Install

First, you need to install the dependencies.

```bash
pnpm add ethers fhevm-rock-paper-scissors
```

## Steps

### 1. Imports

Here are the necessary imports for this guide.

```ts
import { ethers } from "ethers";
import { FHEVMRockPaperScissors, Gesture } from "fhevm-rock-paper-scissors";
```

### 2. Instantiate the SDK and connect a signer

In this guide, you will need to instantiate the signers that will play the Rock-Paper-Scissors game. Choose your
preferred way of doing it as long as they are compatible with the `ethers.Signer` interface.

```ts
const player1: ethers.Signer = // ...
const player2: ethers.Signer = // ...
```

Instantiate the `FHEVMRockPaperScissors` class exported from the library and connect your first signer by calling the
[`connect`](./sdk-technical-reference.md#connect) method.

```ts
const sdk = new FHEVMRockPaperScissors();
await sdk.connect({ signer: player1 });
```

Optionally, call the [`getConnectedPlayerAddress`](./sdk-technical-reference.md#getconnectedplayeraddress) method to
check that the `player1` signer was correctly connected.

```ts
const signer1Address = await sdk.getConnectedPlayerAddress();
console.log("signer1Address", signer1Address);
```

### 3. Create a new game

Call the [`createGame`](./sdk-technical-reference.md#creategame) method to create a new rock-paper-scissors game with
your connected signer. You need to have enough funds in the signer account to cover the cost of the deployment of the
game contract.

Wait until the `gameAddress` is returned. This is the address where the new game contract is deployed. You also have
access to the executed transaction (`tx`) and `receipt` details.

```ts
const { tx: txCreation, wait: waitCreation } = await sdk.createGame();
const { receipt: receiptCreation, gameAddress } = await waitCreation();

console.log("txCreation", txCreation);
console.log("receiptCreation", receiptCreation);
console.log("gameAddress", gameAddress);
```

### 4. List the existing games

Instead of creating a new game, you can check the existing ones by calling the
[`getGames`](./sdk-technical-reference.md#getgames) method and iterating on the list of game addresses by requesting
different pages.

```ts
const gameAddresses = await sdk.getGames({ page: 1, pageSize: 10 });
console.log(gameAddresses);
```

Check the following step to know if the games are already completed and resolved or if they are ready to be played.

### 5. Get the game information

Call the [`getGameInfo`](./sdk-technical-reference.md#getgameinfo) method to get the state of a game by passing its
address as an argument. The returned object includes the addresses of the two players, their encrypted played gestures,
and the winner. If the players, gestures, or winner are not set, they will be `undefined` until they are.

```ts
const gameInfo = await sdk.getGameInfo({ gameAddress });
console.log("state", gameInfo.state);
console.log("player1", gameInfo.player1);
console.log("player2", gameInfo.player2);
console.log("gesture1", gameInfo.gesture1);
console.log("gesture2", gameInfo.gesture2);
console.log("winnerAddress", gameInfo.winnerAddress);
```

The state of a game can be `WaitingForPlayers`, `PlayerOnePlayed`, `PlayerTwoPlayed`, `WaitingForWinner`, or `Resolved`,
meaning that only the first two states will allow you to play (as the first or second player).

### 6. Play with first player

To participate in a game you need to call the [`play`](./sdk-technical-reference.md#play) method, passing the
`gameAddress` and the selected `gesture`. Choose any of the options available in the `Gesture` enum: `Rock`, `Paper`, or
`Scissors`.

```ts
const gesture1 = Gesture.Paper;
const { tx: txPlayer1, wait: waitPlayer1 } = await sdk.play({ gameAddress, gesture: gesture1 });
const { receipt: receiptPlayer1 } = await waitPlayer1();

console.log("txPlayer1", txPlayer1);
console.log("receiptPlayer1", receiptPlayer1);
```

Check the [`getGameInfo`](./sdk-technical-reference.md#getgameinfo) method again to see how the `state` has changed to
`PlayerOnePlayed`, and the `player1` and `gesture1` are now set. Notice how `gesture1` is encrypted so no one can read
its value.

### 7. Play with second player

Connect now the signer of the second player.

```ts
await sdk.connect({ signer: player2 });
const signer2Address = await sdk.getConnectedPlayerAddress();

console.log("signer2Address", signer2Address);
```

And repeat the same process to play.

```ts
const gesture2 = Gesture.Rock;
const { tx: txPlayer2, wait: waitPlayer2 } = await sdk.play({ gameAddress, gesture: gesture2 });
const { receipt: receiptPlayer2 } = await waitPlayer2();

console.log("txPlayer2", txPlayer2);
console.log("receiptPlayer2", receiptPlayer2);
```

Check the [`getGameInfo`](./sdk-technical-reference.md#getgameinfo) method again to see how the information has changed.
At this point, the `state` must be `PlayerTwoPlayed` and only the winner is missing.

### 8. Check the winner

To request the winner of the game, call the [`computeWinner`](./sdk-technical-reference.md#computewinner) method.

```ts
const { tx: txWinner, wait: waitWinner } = await sdk.computeWinner(gameAddress);
const { receipt: receiptWinner } = await waitWinner();

console.log("txWinner", txWinner);
console.log("receiptWinner", receiptWinner);
```

Once requested, the state of the game will change to `WaitingForWinner`.

A few seconds or minutes after the transaction to request the winner is executed, the state of the game will change to
`Resolved` and the `winnerAddress` will be set to the address of the winner. In case of a draw, the zero address will be
set as the winner.

## Recap

You have now successfully deployed, played, and resolved a FHEVM Rock-Paper-Scissors game using the SDK.

Check the [Hardhat Quick Start](./hardhat-quick-start.md) to learn how to interact with the Rock-Paper-Scissors
contracts using the Hardhat tasks.
