import { createInstance, FhevmInstance } from "@zama-fhe/relayer-sdk/node";
import { ethers } from "ethers";
import { NETWORK_CONFIG } from "./config";
import { FactoryEvents, GameEvents, GameState, Gesture } from "./types";
import { FHERockPaperScissorsFactory } from "./types/contracts/FHERockPaperScissorsFactory";
import { FHERockPaperScissors__factory } from "./types/factories/contracts/FHERockPaperScissors__factory";
import { FHERockPaperScissorsFactory__factory } from "./types/factories/contracts/FHERockPaperScissorsFactory__factory";
import { getGameInfo, validateGameState } from "./utils";

/**
 * SDK for interacting with the FHE Rock-Paper-Scissors contracts
 *
 * This class provides a typed interface for:
 * - Connecting a signer to the factory and existing games
 * - Retrieving the onchain information of a game
 * - Creating new games
 * - Playing encrypted gestures
 * - Computing and retrieving the winner of a game
 */
export class FHEVMRockPaperScissors {
  /**
   * The instance of the game contract factory
   */
  #factoryContract?: FHERockPaperScissorsFactory;

  /**
   * The signer of the connected account
   */
  #signer?: ethers.Signer;

  /**
   * The FHEVM instance
   */
  #sdk?: FhevmInstance;

  /**
   * Returns a new instance of the FHEVMRockPaperScissors SDK
   */
  constructor() {}

  /**
   * Connects the SDK to the blockchain using a provided signer
   *
   * @param signer - An Ethers.js signer configured with a provider
   * @throws If the signer lacks a network or the chain is unsupported
   *
   * @example
   * ```ts
   * const sdk = new FHEVMRockPaperScissors();
   * await sdk.connect({ signer });
   * ```
   */
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

  /**
   * Returns the wallet address of the connected player.
   *
   * @returns The connected wallet address
   *
   * @throws If no account is connected
   *
   * @example
   * ```ts
   * const playerAddress = await sdk.getConnectedPlayerAddress();
   * ```
   */
  async getConnectedPlayerAddress() {
    if (!this.#signer) {
      throw new Error("Account not connected");
    }
    return this.#signer.getAddress();
  }

  /**
   * Returns a paginated list of created games from the configured contract factory.
   *
   * @param page - Page number (defaults to 1, must be greater than 0)
   * @param pageSize - Number of games per page (defaults to 10, must be greater than 0 and lower than or equal to 10)
   * @returns A list of game addresses
   *
   * @throws If no account is connected
   *
   * @example
   * ```ts
   * const games = await sdk.getGames({ page: 1, pageSize: 10 });
   * ```
   */
  async getGames({ page, pageSize }: { page?: number; pageSize?: number }) {
    if (!this.#factoryContract) {
      throw new Error("Account not connected");
    }
    const validatedPage = !page || page < 1 ? 1 : page;
    const validatedPageSize = !pageSize || pageSize > 10 ? 10 : pageSize;
    return this.#factoryContract.getPaginatedGames(validatedPage, validatedPageSize);
  }

  /**
   * Returns the game information for a specific game contract.
   *
   * @param gameAddress - The address of the Rock-Paper-Scissors game contract
   * @returns The game information including the state, players, gestures, and winner
   *
   * @throws If no account is connected
   * @throws If the game is not in a valid state
   * @throws If the play transaction fails
   *
   * @example
   * ```ts
   * const gameInfo = await sdk.getGameInfo({ gameAddress });
   * ```
   */
  async getGameInfo({ gameAddress }: { gameAddress: string }) {
    if (!this.#signer) {
      throw new Error("Account not connected");
    }
    const gameContract = FHERockPaperScissors__factory.connect(gameAddress, this.#signer);
    const [state, player1, player2, gesture1, gesture2, winnerAddress] = await gameContract.getGame();
    return getGameInfo(state, player1, player2, gesture1, gesture2, winnerAddress);
  }

  /**
   * Deploys a new FHE Rock-Paper-Scissors game contract.
   *
   * @returns Transaction object and `wait()` handler for the transaction receipt and the game address
   *
   * @throws If no account is connected
   * @throws If the game creation transaction fails
   *
   * @example
   * ```ts
   * const { tx, wait } = await sdk.createGame();
   * const { receipt, gameAddress } = await wait();
   * ```
   */
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

  /**
   * Plays an encrypted gesture (Rock, Paper, or Scissors) in a given game.
   *
   * @param gameAddress - Address of the game contract
   * @param gesture - Gesture played (0 = Rock, 1 = Paper, 2 = Scissors)
   * @returns Transaction object and `wait()` handler for the transaction receipt
   *
   * @throws If no account is connected
   * @throws If the game is not in a valid state
   * @throws If the play transaction fails
   *
   * @example
   * ```ts
   * const { tx, wait } = await sdk.play({ gameAddress, gesture: Gesture.Rock });
   * const { receipt } = await wait();
   * ```
   */
  async play({ gameAddress, gesture }: { gameAddress: string; gesture: Gesture }) {
    if (!this.#factoryContract || !this.#signer || !this.#sdk) {
      throw new Error("Account not connected");
    }
    const gameContract = FHERockPaperScissors__factory.connect(gameAddress, this.#signer);
    await validateGameState(gameContract, [GameState.WaitingForPlayers, GameState.PlayerOnePlayed]);

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

  /**
   * Requests the computation of the winner of the game.
   *
   * @param gameAddress - Address of the game contract
   * @returns Transaction object and `wait()` handler for the transaction receipt
   *
   * @throws If no account is connected
   * @throws If the game is not in a valid state
   * @throws If the winner computation transaction fails
   *
   * @example
   * ```ts
   * const { tx, wait } = await sdk.computeWinner(gameAddress);
   * const { receipt } = await wait();
   * ```
   */
  async computeWinner(gameAddress: string) {
    if (!this.#factoryContract || !this.#signer || !this.#sdk) {
      throw new Error("Account not connected");
    }
    const gameContract = FHERockPaperScissors__factory.connect(gameAddress, this.#signer);
    await validateGameState(gameContract, [GameState.PlayerTwoPlayed]);

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
