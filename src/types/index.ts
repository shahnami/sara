import { SafeVersion } from "@fluidkey/stealth-account-kit/lib/predictStealthSafeAddressTypes";
import { GetBalanceReturnType } from "@wagmi/core";

export type Address = `0x${string}`;
export type SupportedChainId = 1 | 10 | 137 | 42_161 | 8453 | 100 | 11_155_111;

export type FKMetaStealthKeyPair = {
  spendingPrivateKey: Address;
  viewingPrivateKey: Address;
};

export type FKStealthSafeAddressGenerationParams = {
  chainId: number;
  startNonce: number;
  endNonce: number;
  safeVersion: SafeVersion;
  useDefaultAddress: boolean;
  exportPrivateKey?: boolean;
};
