import { createInstance, FhevmInstance } from "@zama-fhe/relayer-sdk/node";
import { ethers } from "ethers";
import { NETWORK_CONFIG } from "./config";
import { FactoryEvents, GameEvents, GameState, Gesture } from "./types";
import { FHERockPaperScissorsFactory } from "./types/contracts/FHERockPaperScissorsFactory";
import { FHERockPaperScissors__factory } from "./types/factories/contracts/FHERockPaperScissors__factory";
import { FHERockPaperScissorsFactory__factory } from "./types/factories/contracts/FHERockPaperScissorsFactory__factory";
import { getGameInfo, validateGameState } from "./utils";

export class FHEVMRockPaperScissors {
  #factoryContract?: FHERockPaperScissorsFactory;
  #signer?: ethers.Signer;
  #sdk?: FhevmInstance;

  constructor() {}

  async connect({ signer }: { signer: ethers.Signer }) {
    const chainId = (await signer?.provider?.getNetwork())?.chainId;
    if (!chainId) {
      throw new Error("Chain not provided in the signer");
    }
    const chainConfig = NETWORK_CONFIG[chainId.toString()];
    if (!chainConfig) {
      throw new Error(`Chain ${chainId} not supported`);
    }
    this.#signer = signer;
    const factoryAddress = chainConfig.fheRockPaperScissorsFactoryAddress;
    this.#factoryContract = FHERockPaperScissorsFactory__factory.connect(factoryAddress, this.#signer);
    this.#sdk = await createInstance(chainConfig.fheChainConfig);
  }

  async getConnectedPlayerAddress() {
    if (!this.#signer) {
      throw new Error("Account not connected");
    }
    return this.#signer.getAddress();
  }

  async getGames({ page, pageSize }: { page?: number; pageSize?: number }) {
    if (!this.#factoryContract) {
      throw new Error("Account not connected");
    }
    const validatedPage = !page || page < 1 ? 1 : page;
    const validatedPageSize = !pageSize || pageSize > 10 ? 10 : pageSize;
    return this.#factoryContract.getPaginatedGames(validatedPage, validatedPageSize);
  }

  async getGameInfo({ gameAddress }: { gameAddress: string }) {
    if (!this.#signer) {
      throw new Error("Account not connected");
    }
    const gameContract = FHERockPaperScissors__factory.connect(gameAddress, this.#signer);
    const [state, player1, player2, gesture1, gesture2, winnerAddress] = await gameContract.getGame();
    return getGameInfo(state, player1, player2, gesture1, gesture2, winnerAddress);
  }

  async createGame() {
    if (!this.#factoryContract) {
      throw new Error("Account not connected");
    }
    const tx = await this.#factoryContract.deployGame();

    const wait = async () => {
      const receipt = await tx.wait();
      const gameCreatedTopic = this.#factoryContract?.interface.getEvent(FactoryEvents.GameCreated).topicHash;
      for (const log of receipt?.logs || []) {
        if (log.topics[0] === gameCreatedTopic) {
          const parsed = this.#factoryContract?.interface.parseLog(log);
          if (parsed?.name === FactoryEvents.GameCreated) {
            return { receipt, gameAddress: parsed.args?.[0] };
          }
        }
      }
      throw new Error("Game creation failed");
    };
    return { tx, wait };
  }

  async play({ gameAddress, gesture }: { gameAddress: string; gesture: Gesture }) {
    if (!this.#factoryContract || !this.#signer || !this.#sdk) {
      throw new Error("Account not connected");
    }
    const gameContract = FHERockPaperScissors__factory.connect(gameAddress, this.#signer);
    validateGameState(gameContract, [GameState.WaitingForPlayers, GameState.PlayerOnePlayed]);

    const playerAddress = await this.#signer.getAddress();
    const encryptedInput = await this.#sdk.createEncryptedInput(gameAddress, playerAddress).add8(gesture).encrypt();
    const tx = await gameContract.play(encryptedInput.handles[0], encryptedInput.inputProof);

    const wait = async () => {
      const receipt = await tx.wait();
      const playerOnePlayedTopic = gameContract.interface.getEvent(GameEvents.PlayerOnePlayed).topicHash;
      const playerTwoPlayedTopic = gameContract.interface.getEvent(GameEvents.PlayerTwoPlayed).topicHash;
      for (const log of receipt?.logs || []) {
        if (log.topics[0] === playerOnePlayedTopic || log.topics[0] === playerTwoPlayedTopic) {
          const parsed = gameContract.interface.parseLog(log);
          if (parsed?.name === GameEvents.PlayerOnePlayed || parsed?.name === GameEvents.PlayerTwoPlayed) {
            return { receipt, playerAddress: parsed.args?.[0] };
          }
        }
      }
      throw new Error("Play failed");
    };
    return { tx, wait };
  }

  async computeWinner(gameAddress: string) {
    if (!this.#factoryContract || !this.#signer || !this.#sdk) {
      throw new Error("Account not connected");
    }
    const gameContract = FHERockPaperScissors__factory.connect(gameAddress, this.#signer);
    validateGameState(gameContract, [GameState.PlayerTwoPlayed]);

    const tx = await gameContract.computeWinner();

    const wait = async () => {
      const receipt = await tx.wait();
      if (receipt?.status !== 1) {
        throw new Error("Winner computation failed");
      }
      return { receipt };
    };
    return { tx, wait };
  }
}
