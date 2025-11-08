import { ethers } from "ethers";
import { GameInfo, GameState } from "./types";
import { FHERockPaperScissors } from "./types/contracts/FHERockPaperScissors";
import { FHERockPaperScissorsFactory } from "./types/contracts/FHERockPaperScissorsFactory";

export function getGameStateName(state: GameState) {
  return state === GameState.WaitingForPlayers
    ? "WaitingForPlayers"
    : state === GameState.PlayerOnePlayed
      ? "PlayerOnePlayed"
      : state === GameState.PlayerTwoPlayed
        ? "PlayerTwoPlayed"
        : state === GameState.WaitingForWinner
          ? "WaitingForWinner"
          : "Resolved";
}

export async function validateGameAddress(factoryContract: FHERockPaperScissorsFactory, gameAddress: string) {
  const gameAddressFromFactory = await factoryContract.games(gameAddress);
  if (!gameAddressFromFactory) {
    throw new Error("Game not found");
  }
}

export async function validateGameState(gameContract: FHERockPaperScissors, states: GameState[]) {
  const gameInfo = await gameContract.getGame();
  const gameState = Number(gameInfo[0]);
  if (!states.includes(gameState)) {
    throw new Error(
      `Game state: ${getGameStateName(gameState)}. Expected state${states.length > 1 && "s"}: ${states.map(getGameStateName).join(", ")}`,
    );
  }
}

export function getGameInfo(
  state: bigint,
  player1: string,
  player2: string,
  gesture1: string,
  gesture2: string,
  winnerAddress: string,
) {
  const gameInfo: GameInfo = {
    state: GameState[Number(state)] as keyof typeof GameState,
    player1: player1 && player1 !== ethers.ZeroAddress ? ethers.getAddress(player1) : undefined,
    player2: player2 && player2 !== ethers.ZeroAddress ? ethers.getAddress(player2) : undefined,
    gesture1: gesture1 && gesture1 !== ethers.ZeroHash ? gesture1 : undefined,
    gesture2: gesture2 && gesture2 !== ethers.ZeroHash ? gesture2 : undefined,
    winnerAddress: winnerAddress && winnerAddress !== ethers.ZeroAddress ? ethers.getAddress(winnerAddress) : undefined,
  };
  return gameInfo;
}
