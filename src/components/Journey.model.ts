import { predictStealthSafeAddressWithBytecode } from "@fluidkey/stealth-account-kit";
import { GetBalanceReturnType, getBalance } from "@wagmi/core";
import { isEmpty } from "lodash";
import { formatUnits } from "viem";

// Config
import { TokenDeployments, getConfig } from "@configs/rainbow.config";
import {
  SAFE_PROXY_BYTECODE,
  SupportedChainIds,
  SupportedSafeVersions,
  getPrivateKeyForSigner,
} from "@utils/fluidkey";
import Bottleneck from "bottleneck";

// Types
import {
  Address,
  CreateCSVEntryParams,
  FluidKeyStealthSafeAddressGenerationParams,
  SupportedChainId,
} from "@typing/index";

const balanceOrder = ["ETH", "USDT", "USDC", "DAI"];
const chainNativeCurrencies = ["SEP"]; // Add any native currencies here that will be represented as ETH

const limiter = new Bottleneck({
  minTime: 200, // minimum time (in ms) between requests
  maxConcurrent: 10, // maximum concurrent requests
});

export const scheduleRequest = <T>(call: () => Promise<T>) => {
  return limiter.schedule(() => {
    return call();
  });
};

const convertToNativeCurrency = (symbol: string) => {
  return chainNativeCurrencies.includes(symbol) ? "ETH" : symbol;
};

const fillRejectedBalances = (
  settledBalances: { value: string; symbol: string }[]
) => {
  const missingSymbols = balanceOrder.filter(
    (symbol) =>
      !settledBalances
        .map((balance) => balance.symbol)
        .map(convertToNativeCurrency)
        .includes(symbol)
  );
  return settledBalances
    .concat(
      missingSymbols.map((symbol) => {
        return { value: "-", symbol };
      })
    )
    .sort((a, b) => {
      return balanceOrder.indexOf(a.symbol) - balanceOrder.indexOf(b.symbol);
    })
    .map((balance) => `${balance.value}`);
};

const filterSettledBalances = (
  balances: PromiseSettledResult<GetBalanceReturnType>[]
) => {
  return balances
    .filter((balance) => balance.status === "fulfilled")
    .map(
      (balance) =>
        (balance as PromiseFulfilledResult<GetBalanceReturnType>).value
    )
    .sort((a, b) => {
      return balanceOrder.indexOf(a.symbol) - balanceOrder.indexOf(b.symbol);
    })
    .map((balance) => {
      return {
        value: formatUnits(balance.value, balance.decimals),
        symbol: balance.symbol,
      };
    });
};

const getBalances = async (address: Address, chainId: SupportedChainId, customTransport?: string) => {
  const config = getConfig(customTransport);

  const ETHBalance = getBalance(config, {
    address: address,
    chainId: chainId,
  });

  const USDCBalance = getBalance(config, {
    address: address,
    token: TokenDeployments[chainId].USDC,
    chainId: chainId,
  });

  const USDTBalance = getBalance(config, {
    address: address,
    token: TokenDeployments[chainId].USDT,
    chainId: chainId,
  });

  const DAIBalance = getBalance(config, {
    address: address,
    token: TokenDeployments[chainId].DAI,
    chainId: chainId,
  });

  return Promise.allSettled([ETHBalance, USDCBalance, USDTBalance, DAIBalance]);
};

export const createCSVEntry = async (
  params: CreateCSVEntryParams,
  callback: () => void
) => {
  try {
    const { stealthSafeAddress } = predictStealthSafeAddressWithBytecode({
      safeProxyBytecode: SAFE_PROXY_BYTECODE,
      chainId: params.settings.chainId,
      threshold: 1,
      stealthAddresses: params.stealthAddresses,
      useDefaultAddress: params.settings.useDefaultAddress,
      safeVersion: params.settings.safeVersion,
      initializerExtraFields: {
        to: params.settings.initializerTo,
        data: params.settings.initializerData,
      },
    });

    let filledBalances = ["-", "-", "-", "-"];
    let status = "Success";

    if (params.settings.customTransport) {
      const balances = await getBalances(
        stealthSafeAddress,
        params.settings.chainId > 0
          ? (params.settings.chainId as SupportedChainId)
          : params.activeChainId,
        params.settings.customTransport
      );
      const settledBalances = filterSettledBalances(balances);
      filledBalances = fillRejectedBalances(settledBalances);
      status = settledBalances.length < balances.length ? "Partial Success" : "Success";
    }

    callback();

    return [
      params.nonce.toString(),
      stealthSafeAddress,
      ...params.stealthAddresses,
      params.settings.exportPrivateKeys
        ? getPrivateKeyForSigner({ ...params.meta })
        : "-",
      ...filledBalances,
      status,
    ];
  } catch (e) {
    return [
      params.nonce.toString(),
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      `Failed: ${(e as Error).message}`,
    ];
  }
};

export const defaultExportHeaders = [
  "Nonce",
  "Safe Address",
  "Signer Address",
  "Signer Private Key",
  "ETH Balance",
  "USDT Balance",
  "USDC Balance",
  "DAI Balance",
  "Status",
];

export const validateSettings = (
  setting: keyof FluidKeyStealthSafeAddressGenerationParams,
  settings: FluidKeyStealthSafeAddressGenerationParams
): boolean => {
  switch (setting) {
    case "chainId":
      if (
        !isFinite(settings.chainId) ||
        !SupportedChainIds.includes(settings.chainId)
      ) {
        return false;
      }
      break;
    case "startNonce":
      if (
        !isFinite(settings.startNonce) ||
        (settings.startNonce as any) === "" ||
        settings.startNonce < 0 ||
        settings.startNonce > settings.endNonce
      ) {
        return false;
      }
      break;
    case "endNonce":
      if (
        !isFinite(settings.endNonce as number) ||
        (settings.endNonce as any) === "" ||
        settings.endNonce < 0 ||
        settings.endNonce < settings.startNonce
      ) {
        return false;
      }
      break;
    case "safeVersion":
      if (
        isEmpty(settings.safeVersion) ||
        !SupportedSafeVersions.includes(settings.safeVersion)
      ) {
        return false;
      }
      break;
    default:
      return true;
  }
  return true;
};
