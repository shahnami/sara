import * as secp from "@noble/secp256k1";
import { keccak256, pad, toHex } from "viem";

import { Address } from "@typing/index";

export const SAFE_PROXY_BYTECODE =
  "0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564";

export const getMessageToSign = (params: {
  address: Address;
  secret: string;
}) => {
  const nonce = keccak256(toHex(params.address + params.secret)).replace(
    "0x",
    ""
  );
  const message = `Sign this message to generate your Fluidkey private payment keys.

WARNING: Only sign this message within a trusted website or platform to avoid loss of funds.

Secret: ${nonce}`;

  return message;
};

export const getPrivateKeyForSigner = (params: {
  ephemeralPrivateKey: Address;
  spendingPrivateKey: Address;
  spendingPublicKey: Address;
}) => {
  const sharedSecret = secp.getSharedSecret(
    params.ephemeralPrivateKey.slice(2),
    params.spendingPublicKey.slice(2),
    false
  );
  // // Hash the shared secret
  const hashedSharedSecret = keccak256(toHex(sharedSecret.slice(1)));

  // Multiply the spending private key by the hashed shared secret
  const stealthAddressSignerPrivateKey =
    (BigInt(params.spendingPrivateKey) * BigInt(hashedSharedSecret)) %
    secp.CURVE.n;

  return pad(toHex(stealthAddressSignerPrivateKey));
};

export const SupportedChainIds = [0, 1, 10, 137, 42_161, 8453, 100, 11_155_111];
export const SupportedSafeVersions = [
  "1.4.1",
  "1.3.0",
  "1.2.0",
  "1.1.1",
  "1.0.0",
];
