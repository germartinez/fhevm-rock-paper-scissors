import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHERockPaperScissorsFactory = await deploy("FHERockPaperScissorsFactory", {
    from: deployer,
    log: true,
  });

  console.log(`FHERockPaperScissorsFactory contract: `, deployedFHERockPaperScissorsFactory.address);
};
export default func;
func.id = "deploy_fheRockPaperScissors"; // id required to prevent reexecution
func.tags = ["FHERockPaperScissors"];
