import { predictStealthSafeAddressWithBytecode } from "@fluidkey/stealth-account-kit";
import { formatUnits } from "viem";
import { GetBalanceReturnType, getBalance } from "@wagmi/core";

// Config
import { TokenDeployments, config } from "../configs/rainbow.config";
import { SAFE_PROXY_BYTECODE, getPrivateKeyForSigner } from "../utils/fluidkey";

// Types
import {
  Address,
  FKStealthSafeAddressGenerationParams,
  IsErrorBalance,
  SupportedChainId,
} from "../types";

const balanceOrder = ["ETH", "USDT", "USDC", "DAI"];

const handleSettledBalances = (
  balances: PromiseSettledResult<GetBalanceReturnType>[]
) => {
  // Check if the promise to retrieve a balance was rejected
  // and return "N/A" if it was, otherwise return the formatted balance
  return balances
    .map((p) => {
      if (p.status === "rejected") {
        return {
          error: p.reason,
        };
      }
      return p.value as GetBalanceReturnType;
    })
    .sort((a, b) => {
      if (!IsErrorBalance(a) && !IsErrorBalance(b))
        return balanceOrder.indexOf(a.symbol) - balanceOrder.indexOf(b.symbol);
      return -1;
    })
    .map((balance) =>
      IsErrorBalance(balance)
        ? "N/A"
        : formatUnits(balance.value, balance.decimals)
    );
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

export const createCSVEntry = async (
  nonce: number,
  stealthAddresses: string[],
  settings: FKStealthSafeAddressGenerationParams,
  chainId: SupportedChainId
) => {
  try {
    const { stealthSafeAddress } = await predictStealthSafeAddressWithBytecode({
      safeProxyBytecode: SAFE_PROXY_BYTECODE,
      chainId: settings.chainId,
      threshold: 1,
      stealthAddresses,
      useDefaultAddress: settings.useDefaultAddress,
      safeVersion: settings.safeVersion,
    });

    const balances = await getBalances(stealthSafeAddress, chainId);
    const settledBalances = handleSettledBalances(balances);
    return [
      nonce.toString(),
      stealthSafeAddress,
      ...stealthAddresses,
      settings.exportPrivateKey ? getPrivateKeyForSigner() : "-",
      ...settledBalances,
      settledBalances.includes("N/A") ? "Partial Success" : "Success",
    ];
  } catch (e) {
    return [
      nonce.toString(),
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
