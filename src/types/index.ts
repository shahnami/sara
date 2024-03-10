import { SafeVersion } from "@fluidkey/stealth-account-kit/lib/predictStealthSafeAddressTypes";

export type Address = `0x${string}`;
export type SupportedChainId = 1 | 10 | 137 | 42_161 | 8453 | 100 | 11_155_111;

export type FluidKeyMetaStealthKeyPair = {
  spendingPrivateKey: Address;
  viewingPrivateKey: Address;
};

export type FluidKeyStealthSafeAddressGenerationParams = {
  chainId: number;
  startNonce: number;
  endNonce: number;
  safeVersion: SafeVersion;
  useDefaultAddress: boolean;
  exportPrivateKeys?: boolean;
};

export type CreateCSVEntryParams = {
  nonce: number;
  stealthAddresses: string[];
  settings: FluidKeyStealthSafeAddressGenerationParams;
  activeChainId: SupportedChainId;
  meta: {
    ephemeralPrivateKey: Address;
    spendingPrivateKey: Address;
    spendingPublicKey: Address;
  };
};
