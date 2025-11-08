import { Address } from "hardhat-deploy/types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deployment and Interaction (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the FHERockPaperScissorsFactory contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the FHERockPaperScissorsFactory contract
 *
 *   npx hardhat --network sepolia task:factory-address
 *   npx hardhat --network sepolia task:create-game [--address 0x...]
 *   npx hardhat --network sepolia task:games --page 1 --pagesize 10 [--address 0x...]
 *   npx hardhat --network sepolia task:game-count [--address 0x...]
 *
 */

/**
 * Returns the deployed `FHERockPaperScissorsFactory` address.
 *
 * Example:
 *   - npx hardhat --network localhost task:factory-address
 *   - npx hardhat --network sepolia task:factory-address
 */
task("task:factory-address", "Prints the game factory address").setAction(async function (
  _taskArguments: TaskArguments,
  hre,
) {
  const { deployments } = hre;

  const fheRockPaperScissorsFactory = await deployments.get("FHERockPaperScissorsFactory");

  console.log("FHERockPaperScissorsFactory address is " + fheRockPaperScissorsFactory.address);
});

/**
 * Deploys a new `FHERockPaperScissors` contract from the factory.
 *
 * Example:
 *   - npx hardhat --network localhost task:create-game [--address 0x...]
 *   - npx hardhat --network sepolia task:create-game [--address 0x...]
 */
task("task:create-game", "Creates a new game")
  .addOptionalParam("address", "Optionally specify the FHERockPaperScissorsFactory contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    // Get contract factory instance
    const FHERockPaperScissorsFactoryDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHERockPaperScissorsFactory");
    const fheRockPaperScissorsFactoryContract = await ethers.getContractAt(
      "FHERockPaperScissorsFactory",
      FHERockPaperScissorsFactoryDeployment.address,
    );

    // Create a new game
    const signers = await ethers.getSigners();
    const tx = await fheRockPaperScissorsFactoryContract.connect(signers[0]).deployGame();
    console.log(`Wait for tx...`);
    const receipt = await tx.wait();
    console.log(`txHash=${tx.hash} status=${receipt?.status}`);

    // Parse event logs
    const logs = receipt?.logs.find((log) => log.fragment?.name === "GameCreated");
    if (!logs) {
      throw new Error("GameCreated event not found");
    }
    const gameAddress = logs.args[0];
    const creator = logs.args[1];
    console.log(`Deployment of new game (address=${gameAddress}, creator=${creator}) succeeded!`);
  });

/**
 * Returns a paginated list of the games deployed by the factory contract.
 *
 * Example:
 *   - npx hardhat --network localhost task:games --page 1 --pagesize 10 [--address 0x...]
 *   - npx hardhat --network sepolia task:games --page 1 --pagesize 10 [--address 0x...]
 */
task("task:games", "Gets the games created")
  .addParam("page", "The page number (page > 0)")
  .addParam("pagesize", "The page size (pagesize > 0 and pagesize <= 10)")
  .addOptionalParam("address", "Optionally specify the FHERockPaperScissorsFactory contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    // Parse arguments
    const page = parseInt(taskArguments.page);
    if (!Number.isInteger(page)) {
      throw new Error(`Argument --page is not an integer (page > 0)`);
    }
    const pageSize = parseInt(taskArguments.pagesize);
    if (!Number.isInteger(pageSize)) {
      throw new Error(`Argument --pagesize is not an integer (pagesize > 0 and pagesize <= 10)`);
    }

    // Get contract factory instance
    const FHERockPaperScissorsFactoryDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHERockPaperScissorsFactory");
    const fheRockPaperScissorsFactoryContract = await ethers.getContractAt(
      "FHERockPaperScissorsFactory",
      FHERockPaperScissorsFactoryDeployment.address,
    );

    // Get the games
    const games = await fheRockPaperScissorsFactoryContract.getPaginatedGames(page, pageSize);
    console.log(`Games: [${games.map((address: Address) => `${address}`).join(", ")}]`);
  });

/**
 * Returns the number of games deployed by the factory contract.
 *
 * Example:
 *   - npx hardhat --network localhost task:game-count [--address 0x...]
 *   - npx hardhat --network sepolia task:game-count [--address 0x...]
 */
task("task:game-count", "Gets the number of games created")
  .addOptionalParam("address", "Optionally specify the FHERockPaperScissorsFactory contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    // Get contract factory instance
    const FHERockPaperScissorsFactoryDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHERockPaperScissorsFactory");
    const fheRockPaperScissorsFactoryContract = await ethers.getContractAt(
      "FHERockPaperScissorsFactory",
      FHERockPaperScissorsFactoryDeployment.address,
    );

    // Get the game count
    const gameCount = await fheRockPaperScissorsFactoryContract.gameCount();
    console.log(`Game count: ${gameCount}`);
  });
