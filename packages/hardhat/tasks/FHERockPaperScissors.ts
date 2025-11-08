import { isAddress } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deployment and Interaction (--network sepolia)
 * ===========================================================
 *
 * 1. Interact with a FHERockPaperScissors contract
 *
 *   npx hardhat --network sepolia task:game-info --address 0x...
 *   npx hardhat --network sepolia task:play --address 0x... --gesture 0 --signerindex 0
 *   npx hardhat --network sepolia task:play --address 0x... --gesture 1 --signerindex 1
 *   npx hardhat --network sepolia task:compute-winner --address 0x...
 *
 */

function getStateName(state: BigInt) {
  return state === 0n
    ? "WaitingForPlayers"
    : state === 1n
      ? "PlayerOnePlayed"
      : state === 2n
        ? "PlayerTwoPlayed"
        : state === 3n
          ? "WaitingForWinner"
          : "Resolved";
}

/**
 * Example:
 *   - npx hardhat --network localhost task:game-info --address 0x...
 *   - npx hardhat --network sepolia task:game-info --address 0x...
 */
task("task:game-info", "Gets the info of a game")
  .addParam("address", "The FHERockPaperScissors contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers } = hre;

    // Parse arguments
    const address = taskArguments.address;
    if (!isAddress(address)) {
      throw new Error(`Argument --address is not an address`);
    }

    // Get game contract instance
    const fheRockPaperScissorsContract = await ethers.getContractAt("FHERockPaperScissors", address);

    // Get game info
    const game = await fheRockPaperScissorsContract.getGame();
    console.log(`state: ${getStateName(game[0])}`);
    console.log(`player1: ${game[1]}`);
    console.log(`player2: ${game[2]}`);
    console.log(`gesture1: ${game[3]}`);
    console.log(`gesture2: ${game[4]}`);
    console.log(`winnerAddress: ${game[5]}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:play --address 0x... --gesture 0 --signerindex 0
 *   - npx hardhat --network sepolia task:play --address 0x... --gesture 0 --signerindex 0
 */
task("task:play", "Plays in a game")
  .addParam("address", "The FHERockPaperScissors contract address")
  .addParam("gesture", "The gesture of a player (0: rock, 1: paper, 2: scissors)")
  .addParam("signerindex", "The hardhat signer index (0-19)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, fhevm } = hre;

    // Parse arguments
    const address = taskArguments.address;
    if (!isAddress(address)) {
      throw new Error(`Argument --address is not an address`);
    }
    const gesture = parseInt(taskArguments.gesture);
    if (!Number.isInteger(gesture)) {
      throw new Error(`Argument --gesture is not an integer (0: rock, 1: paper, 2: scissors)`);
    }
    const signerId = parseInt(taskArguments.signerindex);
    if (!Number.isInteger(signerId) || signerId < 0) {
      throw new Error(`Argument --signerindex is not an integer (signerindex >= 0)`);
    }
    const signer = (await ethers.getSigners())[signerId];

    // Get game contract instance
    const fheRockPaperScissorsContract = await ethers.getContractAt("FHERockPaperScissors", address);

    // Encrypt input data
    await fhevm.initializeCLIApi();
    const encryptedGesture = await fhevm.createEncryptedInput(address, signer.address).add8(gesture).encrypt();

    // Play in the game
    const tx = await fheRockPaperScissorsContract
      .connect(signer)
      .play(encryptedGesture.handles[0], encryptedGesture.inputProof);
    console.log(`Wait for tx...`);
    const receipt = await tx.wait();
    console.log(`txHash=${tx.hash} status=${receipt?.status}`);

    const gameAfterPlay = await fheRockPaperScissorsContract.getGame();

    // Parse event logs
    const logs = receipt?.logs.find((log) => log.fragment?.name === getStateName(gameAfterPlay[0]));
    if (!logs) {
      throw new Error(`${getStateName(gameAfterPlay[0])} event not found`);
    }
    console.log(
      `[${getStateName(gameAfterPlay[0])}] Game played by ${logs.args[0]} with gesture ${logs.args[1]} succeeded!`,
    );
  });

/**
 * Example:
 *   - npx hardhat --network sepolia task:compute-winner --address 0x...
 */
task("task:compute-winner", "Computes the winner of a game")
  .addParam("address", "The FHERockPaperScissors contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    // Parse arguments
    const address = taskArguments.address;
    if (!isAddress(address)) {
      throw new Error(`Argument --address is not an address`);
    }

    // Get game contract instance
    const fheRockPaperScissorsContract = await ethers.getContractAt("FHERockPaperScissors", address);

    // Compute the winner of the game
    const signers = await ethers.getSigners();
    const tx = await fheRockPaperScissorsContract.connect(signers[0]).computeWinner();
    console.log(`Wait for tx...`);
    const receipt = await tx.wait();
    console.log(`txHash=${tx.hash} status=${receipt?.status}`);

    const gameAfterWinnerRequest = await fheRockPaperScissorsContract.getGame();

    // Parse event logs
    const logs = receipt?.logs.find((log) => log.fragment?.name === "WaitingForWinner");
    if (!logs) {
      throw new Error("WaitingForWinner event not found");
    }
    console.log(`[${getStateName(gameAfterWinnerRequest[0])}] Compute winner requested successfully`);
  });
