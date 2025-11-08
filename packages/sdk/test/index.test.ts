import { ethers, HDNodeWallet } from "ethers";
import { beforeAll, describe, expect, it } from "vitest";
import { FHEVMRockPaperScissors } from "../src";
import { Gesture } from "../src/types";

const MNEMONIC = "";
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStatusChange(
  sdk: FHEVMRockPaperScissors,
  gameAddress: string,
  expectedState: string,
  timeout = 120_000,
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const gameInfo = await sdk.getGameInfo({ gameAddress });
    if (gameInfo.state === expectedState) {
      return gameInfo;
    }
    await sleep(10_000);
  }
  throw new Error("Timed out waiting for game");
}

describe("FHEVMRockPaperScissors SDK", () => {
  let sdk: FHEVMRockPaperScissors;
  let player1: ethers.Signer;
  let player2: ethers.Signer;
  let gameAddress: string;

  beforeAll(async () => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    player1 = HDNodeWallet.fromPhrase(MNEMONIC, "", "m/44'/60'/0'/0/0").connect(provider);
    player2 = HDNodeWallet.fromPhrase(MNEMONIC, "", "m/44'/60'/0'/0/1").connect(provider);
    sdk = new FHEVMRockPaperScissors();
    await sdk.connect({ signer: player1 });
  });

  it("should get the connected player address", async () => {
    const address = await sdk.getConnectedPlayerAddress();
    expect(address).toBe(await player1.getAddress());
  });

  it("should fetch created games", async () => {
    const games = await sdk.getGames({ page: 1, pageSize: 10 });
    expect(Array.isArray(games)).toBe(true);
  });

  it("should create a new game and return the game address", async () => {
    const { tx, wait } = await sdk.createGame();
    expect(tx.hash).toBeTruthy();
    const { receipt, gameAddress: newGameAddress } = await wait();
    expect(receipt?.status).toBe(1);
    expect(newGameAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    gameAddress = newGameAddress;
  });

  it("should get the game info", async () => {
    if (!gameAddress) {
      throw new Error("Game not found");
    }
    const gameInfo = await sdk.getGameInfo({ gameAddress });
    expect(gameInfo).toBeDefined();
    expect(gameInfo.state).toBe("WaitingForPlayers");
    expect(gameInfo.player1).toBeUndefined();
    expect(gameInfo.player2).toBeUndefined();
    expect(gameInfo.gesture1).toBeUndefined();
    expect(gameInfo.gesture2).toBeUndefined();
    expect(gameInfo.winnerAddress).toBeUndefined();
  });

  it("should play in the game", async () => {
    if (!gameAddress) {
      throw new Error("Game not found");
    }
    // First player plays
    const gesture1 = Gesture.Paper;
    const { tx: tx1, wait: wait1 } = await sdk.play({ gameAddress, gesture: gesture1 });
    expect(tx1.hash).toBeTruthy();
    const { receipt: receipt1, playerAddress: playerAddress1 } = await wait1();
    expect(receipt1?.status).toBe(1);
    expect(playerAddress1).toBe(await player1.getAddress());

    // Check game info after first player played
    const gameInfoAfterPlayerOne = await sdk.getGameInfo({ gameAddress });
    expect(gameInfoAfterPlayerOne.state).toBe("PlayerOnePlayed");
    expect(gameInfoAfterPlayerOne.player1).toBe(await player1.getAddress());
    expect(gameInfoAfterPlayerOne.player2).toBeUndefined();
    expect(gameInfoAfterPlayerOne.gesture1).toBeTruthy();
    expect(gameInfoAfterPlayerOne.gesture2).toBeUndefined();
    expect(gameInfoAfterPlayerOne.winnerAddress).toBeUndefined();

    // Connect second player
    await sdk.connect({ signer: player2 });

    // Second player plays
    const gesture2 = Gesture.Scissors;
    const { tx: tx2, wait: wait2 } = await sdk.play({ gameAddress, gesture: gesture2 });
    expect(tx2.hash).toBeTruthy();
    const { receipt: receipt2, playerAddress: playerAddress2 } = await wait2();
    expect(receipt2?.status).toBe(1);
    expect(playerAddress2).toBe(await player2.getAddress());

    // Check game info after second player played
    const gameInfoAfterPlayerTwo = await sdk.getGameInfo({ gameAddress });
    expect(gameInfoAfterPlayerTwo.state).toBe("PlayerTwoPlayed");
    expect(gameInfoAfterPlayerTwo.player1).toBe(await player1.getAddress());
    expect(gameInfoAfterPlayerTwo.player2).toBe(await player2.getAddress());
    expect(gameInfoAfterPlayerTwo.gesture1).toBeTruthy();
    expect(gameInfoAfterPlayerTwo.gesture2).toBeTruthy();
    expect(gameInfoAfterPlayerTwo.winnerAddress).toBeUndefined();
  });

  it("should compute the winner after both players have played", async () => {
    if (!gameAddress) {
      throw new Error("Game not found");
    }

    // Compute the winner
    const { tx, wait } = await sdk.computeWinner(gameAddress);
    expect(tx.hash).toBeTruthy();
    const { receipt } = await wait();
    expect(receipt?.status).toBe(1);

    // Check game info after winner computation request
    const gameInfoBeforeWinner = await sdk.getGameInfo({ gameAddress });
    expect(gameInfoBeforeWinner.state).toBe("WaitingForWinner");
    expect(gameInfoBeforeWinner.winnerAddress).toBeUndefined();

    // Wait for the winner to be computed
    const gameInfoAfterWinner = await waitForStatusChange(sdk, gameAddress, "Resolved");
    expect(gameInfoAfterWinner.state).toBe("Resolved");
    expect(gameInfoAfterWinner.winnerAddress).toBe(await player2.getAddress());
  });
});
