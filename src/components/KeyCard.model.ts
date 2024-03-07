import { predictStealthSafeAddressWithBytecode } from "@fluidkey/stealth-account-kit";
import { formatUnits } from "viem";
import { GetBalanceReturnType, getBalance } from "@wagmi/core";

// Config
import { TokenDeployments, config } from "../configs/rainbow.config";
import { SAFE_PROXY_BYTECODE, getPrivateKeyForSigner } from "../utils/fluidkey";

// Types
import { Address, CreateCSVEntryParameters, SupportedChainId } from "../types";

export const MAX_BATCH_SIZE = 30;
const balanceOrder = ["ETH", "USDT", "USDC", "DAI"];
const chainNativeCurrencies = ["SEP"]; // Add any native currencies here that will be represented as ETH

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

const getBalances = async (address: Address, chainId: SupportedChainId) => {
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

export const createCSVEntry = async (params: CreateCSVEntryParameters) => {
  try {
    const { stealthSafeAddress } = predictStealthSafeAddressWithBytecode({
      safeProxyBytecode: SAFE_PROXY_BYTECODE,
      chainId: params.settings.chainId,
      threshold: 1,
      stealthAddresses: params.stealthAddresses,
      useDefaultAddress: params.settings.useDefaultAddress,
      safeVersion: params.settings.safeVersion,
    });

    const balances = await getBalances(stealthSafeAddress, params.chainId);
    const settledBalances = filterSettledBalances(balances);
    const filledBalances = fillRejectedBalances(settledBalances);

    return [
      params.nonce.toString(),
      stealthSafeAddress,
      ...params.stealthAddresses,
      params.settings.exportPrivateKey
        ? getPrivateKeyForSigner({ ...params.meta })
        : "-",
      ...filledBalances,
      settledBalances.length < balances.length ? "Partial Success" : "Success",
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
