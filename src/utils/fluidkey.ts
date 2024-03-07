import { keccak256, toHex } from "viem";
import { Address } from "../types";

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
