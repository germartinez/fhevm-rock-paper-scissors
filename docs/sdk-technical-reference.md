# FHEVM Rock-Paper-Scissors SDK — Technical Reference

## Overview

The `fhevm-rock-paper-scissors` package provides a high-level, type-safe interface for interacting with the FHEVM
Rock-Paper-Scissors smart contracts.

It allows to connect a signer, create and manage rock-paper-scissors games, and compute the winner without revealing the
gestures.

## Technical Reference

[`connect()`](#connect)  
[`getConnectedPlayerAddress()`](#getconnectedplayeraddress)  
[`createGame()`](#creategame)  
[`getGames()`](#getgames)  
[`getGameInfo()`](#getgameinfo)  
[`play()`](#play)  
[`computeWinner()`](#computewinner)

### `connect`

Connects the SDK to the blockchain using a provided signer.

#### Example

```ts
const sdk = new FHEVMRockPaperScissors();
await sdk.connect({ signer });
```

#### Arguments

- `signer`: `ethers.Signer`  
  Ethers.js signer configured with a provider.

#### Returns

`Promise<void>`

#### Throws

- If the signer is not connected to a chain.
- If the chain is unsupported.

### `getConnectedPlayerAddress`

Returns the address of the connected signer.

#### Example

```ts
const address = await sdk.getConnectedPlayerAddress();
```

#### Returns

The address of the connected signer.

`Promise<string>`

#### Throws

- If no signer is connected.

### `createGame`

Deploys a new `FHERockPaperScissors` contract from the factory.

#### Example

```ts
const { tx, wait } = await sdk.createGame();
const { receipt, gameAddress } = await wait();
```

#### Returns

Transaction object and `wait()` handler for the transaction receipt and the deployed game address.

```ts
Promise<{
  tx: ethers.ContractTransaction;
  wait: () => Promise<{
    receipt: ethers.ContractReceipt;
    gameAddress: string;
  }>;
}>;
```

#### Throws

- If the factory contract is not initialized.
- If the game deployment transaction fails.

### `getGames`

Returns a paginated list of the games deployed by the factory contract.

#### Example

```ts
const games = await sdk.getGames({ page: 1, pageSize: 10 });
```

#### Arguments

- `page`: `number`  
  Page number (page > 0). Optional. Defaults to 1.

- `pageSize`: `number`  
  Number of results per page (0 < pageSize ≤ 10). Optional. Defaults to 10.

#### Returns

An array with the addresses of the deployed games.

`Promise<string[]>`

#### Throws

- If the factory contract is not initialized.

### `getGameInfo`

Returns the information of a specific game including state, players, gestures, and winner.

#### Example

```ts
const gameInfo = await sdk.getGameInfo({ gameAddress });
```

#### Arguments

- `gameAddress`: `string`  
  Address of the target game contract.

#### Returns

Structured game information including state, players, gestures, and winner.

```ts
Promise<{
  state: GameState;
  player1: string;
  player2: string;
  gesture1?: Gesture;
  gesture2?: Gesture;
  winner?: string;
}>;
```

#### Throws

- If no signer is connected.

### `play`

Submits an encrypted gesture for the connected player in a given game.

#### Example

```ts
const { tx, wait } = await sdk.play({ gameAddress, gesture: Gesture.Rock });
const { receipt } = await wait();
```

#### Arguments

- `gameAddress`: `string`  
  Address of the target game contract.

- `gesture`: `Gesture`  
  Gesture played (`Rock=0`, `Paper=1`, `Scissors=2`).

#### Returns

Transaction object and `wait()` handler for the transaction receipt and the player address.

```ts
Promise<{
  tx: ethers.ContractTransaction;
  wait: () => Promise<{
    receipt: ethers.ContractReceipt;
    playerAddress: string;
  }>;
}>;
```

#### Throws

- If no signer is connected.
- If the factory contract is not initialized.
- If the FHEVM instance is not initialized.
- If the game is not in the right state.
- If the play transaction fails.

### `computeWinner`

Requests the computation of the winner for a given completed game.

#### Example

```ts
const { tx, wait } = await sdk.computeWinner(gameAddress);
const { receipt } = await wait();
```

#### Arguments

- `gameAddress`: `string`  
  Address of the target game contract.

#### Returns

Transaction object and `wait()` handler for the transaction receipt.

```ts
Promise<{
  tx: ethers.ContractTransaction;
  wait: () => Promise<{
    receipt: ethers.ContractReceipt;
  }>;
}>;
```

#### Throws

- If the factory contract is not initialized.
- If the signer is not connected.
- If the FHEVM instance is not initialized.
- If the game is not in the right state.
- If the winner computation request transaction fails.
