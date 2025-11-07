import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
};
export default func;
func.id = "deploy_fheRockPaperScissors"; // id required to prevent reexecution
func.tags = ["FHERockPaperScissors"];
