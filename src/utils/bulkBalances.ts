import {
  Address,
  BalanceRequirement,
  SupportedChainId,
} from "@typing/index";
import Bottleneck from "bottleneck";
import type { Chain } from "viem";
import {
  createPublicClient,
  defineChain,
  erc20Abi,
  formatUnits,
  http,
} from "viem";
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
} from "viem/chains";

const limiter = new Bottleneck({
  minTime: 200,
  maxConcurrent: 10,
});

export const scheduleRequest = <T>(call: () => Promise<T>) => {
  return limiter.schedule(call);
};

const KNOWN_CHAINS: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
  [optimism.id]: optimism,
  [arbitrum.id]: arbitrum,
  [base.id]: base,
  [gnosis.id]: gnosis,
  [sepolia.id]: sepolia,
  [bsc.id]: bsc,
  [avalanche.id]: avalanche,
};

const getChainConfig = (chainId: number) => {
  return KNOWN_CHAINS[chainId];
};

const buildFallbackChain = (chainId: number, rpcUrl?: string) =>
  defineChain({
    id: chainId,
    name: `Chain ${chainId}`,
    network: `chain-${chainId}`,
    nativeCurrency: {
      name: "Native",
      symbol: "Native",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: rpcUrl ? [rpcUrl] : [] },
    },
    blockExplorers: rpcUrl
      ? {
          default: {
            name: "Explorer",
            url: rpcUrl,
          },
        }
      : undefined,
  });

const isAddress = (value: string): value is Address => {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};

export type BalanceColumnResult = {
  id: string;
  label: string;
  values: Record<Address, string>;
};

const buildTransportUrl = (
  requirement: BalanceRequirement,
  chainConfig: Chain
) => {
  if (requirement.rpcUrl && requirement.rpcUrl.trim().length > 0) {
    return http(requirement.rpcUrl);
  }
  const defaultRpc = chainConfig.rpcUrls?.default?.http?.[0];
  if (!defaultRpc) {
    throw new Error(`No RPC URL configured for chain ${chainConfig.id}`);
  }
  return http(defaultRpc);
};

const formatLabel = (
  requirement: BalanceRequirement,
  chainSymbol: string,
  tokenSymbol?: string
) => {
  if (requirement.tokenAddress) {
    if (
      requirement.label &&
      requirement.label.toLowerCase() !== "token balance"
    ) {
      return requirement.label;
    }
    return `${tokenSymbol ?? "Token"} Balance`;
  }

  if (
    requirement.label &&
    requirement.label.toLowerCase() !== "native balance"
  ) {
    return requirement.label;
  }
  return `${chainSymbol} Balance`;
};

const fetchTokenMetadata = async (
  client: ReturnType<typeof createPublicClient>,
  tokenAddress: Address
) => {
  let decimals = 18;
  let symbol = "Token";
  try {
    const tokenDecimals = (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    })) as number;
    decimals = tokenDecimals;
  } catch {
    // ignore
  }

  try {
    const tokenSymbol = (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    })) as string;
    symbol = tokenSymbol;
  } catch {
    // ignore
  }

  return { decimals, symbol };
};

const MAX_FRACTION_DIGITS = 6;

const formatBalanceValue = (
  value: bigint | null,
  decimals: number
): string => {
  if (value === null) {
    return "-";
  }

  try {
    const raw = formatUnits(value, decimals);
    if (!raw.includes(".")) {
      return raw;
    }

    const [whole, fraction] = raw.split(".");
    const trimmedFraction = fraction.replace(/0+$/, "");
    if (trimmedFraction.length === 0) {
      return whole;
    }

    const shortenedFraction = trimmedFraction.slice(
      0,
      Math.min(MAX_FRACTION_DIGITS, trimmedFraction.length)
    );

    return `${whole}.${shortenedFraction}`;
  } catch {
    return "-";
  }
};

const fetchNativeBalances = async (
  addresses: Address[],
  client: ReturnType<typeof createPublicClient>,
  decimals: number
) => {
  const result: Record<Address, string> = {};
  for (const address of addresses) {
    try {
      const balance = await scheduleRequest(() =>
        client.getBalance({ address })
      );
      result[address] = formatBalanceValue(balance, decimals);
    } catch {
      result[address] = "-";
    }
  }
  return result;
};

const fetchTokenBalances = async (
  addresses: Address[],
  client: ReturnType<typeof createPublicClient>,
  tokenAddress: Address,
  decimals: number
) => {
  const result: Record<Address, string> = {};
  for (const address of addresses) {
    try {
      const balance = await scheduleRequest(() =>
        client.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        })
      );
      result[address] = formatBalanceValue(balance as bigint, decimals);
    } catch {
      result[address] = "-";
    }
  }
  return result;
};

export const fetchBulkBalances = async ({
  addresses,
  requirements,
}: {
  addresses: Address[];
  requirements: BalanceRequirement[];
}): Promise<BalanceColumnResult[]> => {
  const uniqueAddresses = Array.from(
    new Set(addresses.filter((address) => isAddress(address)))
  ) as Address[];

  if (uniqueAddresses.length === 0 || requirements.length === 0) {
    return [];
  }

  const columns: BalanceColumnResult[] = [];

  for (const requirement of requirements) {
    const initialChainConfig = getChainConfig(requirement.chainId);
    const fallbackChain =
      initialChainConfig ??
      buildFallbackChain(requirement.chainId, requirement.rpcUrl);

    const transport = buildTransportUrl(requirement, fallbackChain);
    const client = createPublicClient({
      chain: fallbackChain,
      transport,
    });

    let metadataChain: Chain = initialChainConfig ?? fallbackChain;

    if (requirement.rpcUrl) {
      try {
        const remoteChainId = await client.getChainId();
        const detectedChain =
          getChainConfig(remoteChainId as SupportedChainId) ??
          buildFallbackChain(Number(remoteChainId), requirement.rpcUrl);
        metadataChain = detectedChain;
      } catch {
        // ignore detection issues
      }
    }

    if (requirement.tokenAddress) {
      const { decimals, symbol } = await fetchTokenMetadata(
        client,
        requirement.tokenAddress
      );
      const values = await fetchTokenBalances(
        uniqueAddresses,
        client,
        requirement.tokenAddress,
        decimals
      );
      columns.push({
        id: `${metadataChain.id}:${requirement.tokenAddress.toLowerCase()}`,
        label: formatLabel(
          requirement,
          metadataChain.nativeCurrency?.symbol ?? "Native",
          symbol
        ),
        values,
      });
      continue;
    }

    const values = await fetchNativeBalances(
      uniqueAddresses,
      client,
      metadataChain.nativeCurrency?.decimals ?? 18
    );
    columns.push({
      id: `${metadataChain.id}:native`,
      label: formatLabel(
        requirement,
        metadataChain.nativeCurrency?.symbol ?? "Native"
      ),
      values,
    });
  }

  return columns;
};

