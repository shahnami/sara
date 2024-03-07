import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { SafeVersion } from "@fluidkey/stealth-account-kit/lib/predictStealthSafeAddressTypes";
import {
  generateStealthAddresses,
  generateEphemeralPrivateKey,
  extractViewingPrivateKeyNode,
} from "@fluidkey/stealth-account-kit";
import { useChainId } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { CSVLink } from "react-csv";

import styled from "styled-components";

// Common Components
import { Card } from "./common/Card";
import { Button } from "./common/Button";

// Types
import {
  FKMetaStealthKeyPair,
  FKStealthSafeAddressGenerationParams,
  SupportedChainId,
} from "../types";

// View Model
import { createCSVEntry } from "./KeyCard.model";

const SKeyContainerDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const SCTAContainerDetails = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  gap: 24px;
`;

interface ComponentProps {
  keys: FKMetaStealthKeyPair;
  settings: FKStealthSafeAddressGenerationParams;
}

export const KeysCard = (props: ComponentProps) => {
  const defaultExportHeaders = [
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
  const SupportedSafeVersions: SafeVersion[] = [
    "1.4.1",
    "1.3.0",
    "1.2.0",
    "1.1.1",
    "1.0.0",
  ];

  const [disabled, setDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stealthAddressData, setStealthAddressData] = useState<string[][]>([
    defaultExportHeaders,
  ]);

  const currentChainId = useChainId();

  const retrieveStealthAddresses = async () => {
    setStealthAddressData([defaultExportHeaders]);
    if (props.keys?.viewingPrivateKey && props.keys?.spendingPrivateKey) {
      setIsLoading(true);

      const derivedBIP32Node = extractViewingPrivateKeyNode(
        props.keys.viewingPrivateKey,
        0
      );

      const spendingAccount = privateKeyToAccount(
        props.keys.spendingPrivateKey
      );
      const spendingPublicKey = spendingAccount.publicKey;

      const promises: Promise<string[]>[] = [];
      for (
        let i = props.settings.startNonce;
        i < props.settings.endNonce;
        i++
      ) {
        const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
          viewingPrivateKeyNode: derivedBIP32Node,
          nonce: BigInt(i),
          chainId: currentChainId,
        });

        const { stealthAddresses } = generateStealthAddresses({
          spendingPublicKeys: [spendingPublicKey],
          ephemeralPrivateKey: ephemeralPrivateKey,
        });

        promises.push(
          createCSVEntry(
            i,
            stealthAddresses,
            props.settings,
            currentChainId as SupportedChainId,
            props.settings.exportPrivateKey
              ? {
                  ephemeralPrivateKey: ephemeralPrivateKey,
                  spendingPrivateKey: props.keys.spendingPrivateKey,
                  spendingPublicKey: spendingPublicKey,
                }
              : undefined
          )
        );
      }

      const data = await Promise.all(promises);

      setStealthAddressData((prev) => {
        return [...prev, ...data];
      });

      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (props.settings) {
      if (
        !isFinite(props.settings.chainId) ||
        !isFinite(props.settings.startNonce) ||
        !isFinite(props.settings.endNonce) ||
        isEmpty(props.settings.safeVersion) ||
        !SupportedSafeVersions.includes(props.settings.safeVersion) ||
        props.settings.endNonce < props.settings.startNonce ||
        props.settings.startNonce < 0 ||
        props.settings.endNonce <= 0
      ) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    }
  }, [props.settings]);
  return (
    <Card title="Your Keys">
      <SKeyContainerDetails>
        <b>Spending Private Key:</b>
        <pre>{props.keys?.spendingPrivateKey}</pre>
        <b>Viewing Private Key:</b>
        <pre>{props.keys?.viewingPrivateKey}</pre>
      </SKeyContainerDetails>
      <SCTAContainerDetails>
        <Button
          title="Recover Stealth Addresses"
          onClick={() => retrieveStealthAddresses()}
          type="primary"
          loading={isLoading}
          disabled={disabled}
        />

        <CSVLink
          hidden={
            disabled ||
            stealthAddressData.length <
              props.settings?.endNonce - props.settings?.startNonce + 1
          }
          data={stealthAddressData}
          filename={`${currentChainId}_fluidkey_stealth_addresses.csv`}
        >
          Download Stealth Addresses
        </CSVLink>
      </SCTAContainerDetails>
    </Card>
  );
};
