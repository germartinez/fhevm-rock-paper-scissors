import { FhevmInstanceConfig, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";

type NetworkConfig = {
  [chainId: string]: {
    fheChainConfig: FhevmInstanceConfig;
    fheRockPaperScissorsFactoryAddress: string;
  };
};

export const NETWORK_CONFIG: NetworkConfig = {
  "11155111": {
    fheChainConfig: {
      ...SepoliaConfig,
      network: "https://ethereum-sepolia-rpc.publicnode.com",
    },
    fheRockPaperScissorsFactoryAddress: "0x87B44cB816dbfd73645c8CE6F2d0807cCBc77E91",
  },
};
