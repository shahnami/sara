import { Theme, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit";
import { merge } from "lodash";
import { HttpTransportConfig, http } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

// Types
import { Address, SupportedChainId } from "../types";

const ALL_SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  gnosis,
  sepolia,
  bsc,
  avalanche,
] as const;

const httpTransportConfig: HttpTransportConfig = {
  batch: {
    batchSize: 10,
    wait: 0, // configured by bottleneck limiter `minTime`
  },
  retryCount: 2,
  retryDelay: 10000, // attempt to retry after 10 seconds if rate limited or errors for some reason
};

type GetConfigOptions = {
  chainId?: SupportedChainId;
};

export function getConfig(
  transport: string | undefined,
  options?: GetConfigOptions
) {
  const transports = Object.fromEntries(
    ALL_SUPPORTED_CHAINS.map((chain) => {
      const shouldUseCustomTransport =
        Boolean(transport) &&
        (!options?.chainId || options.chainId === chain.id);

      const fallbackRpc = chain.rpcUrls?.default?.http?.[0];

      const rpcUrl = shouldUseCustomTransport
        ? (transport as string)
        : fallbackRpc;

      if (!rpcUrl) {
        throw new Error(`Missing RPC URL for chain ${chain.id}`);
      }

      return [chain.id, http(rpcUrl, httpTransportConfig)];
    })
  );

  return getDefaultConfig({
    appName: "SARA",
    projectId:
      import.meta.env.WALLET_CONNECT_CLOUD_PROJECT_ID ?? "YOUR_PROJECT_ID",
    chains: ALL_SUPPORTED_CHAINS,
    transports,
  });
}

export const TokenDeployments: {
  [key in SupportedChainId]: {
    USDC: Address;
    USDT: Address;
    DAI: Address;
  };
} = {
  // Mainnet
  1: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  // Optimism
  10: {
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },
  // Polygon
  137: {
    USDC: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  },
  // Arbitrum
  42_161: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },
  // Base
  8453: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0x",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  },
  // Gnosis
  100: {
    USDC: "0x",
    USDT: "0x",
    DAI: "0x",
  },
  // Sepolia
  11_155_111: {
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
    DAI: "0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6",
  },
  // BSC
  56: {
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  },
  // Avalanche
  43_114: {
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
  },
};

export const myRainbowExtendedTheme = merge(lightTheme(), {
  colors: {
    accentColor: "#191919",
  },
} as Theme);
