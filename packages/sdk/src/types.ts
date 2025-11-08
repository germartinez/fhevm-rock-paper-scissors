export enum Gesture {
  Rock = 0,
  Paper = 1,
  Scissors = 2,
}

export enum FactoryEvents {
  GameCreated = "GameCreated",
}

export enum GameEvents {
  WaitingForPlayers = "WaitingForPlayers",
  PlayerOnePlayed = "PlayerOnePlayed",
  PlayerTwoPlayed = "PlayerTwoPlayed",
  WaitingForWinner = "WaitingForWinner",
  Resolved = "Resolved",
}

export enum GameState {
  WaitingForPlayers = 0,
  PlayerOnePlayed = 1,
  PlayerTwoPlayed = 2,
  WaitingForWinner = 3,
  Resolved = 4,
}

export type GameInfo = {
  state: keyof typeof GameState;
  player1?: string;
  player2?: string;
  gesture1?: string;
  gesture2?: string;
  winnerAddress?: string;
};
