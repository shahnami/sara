import { useState } from "react";
import { useAccount } from "wagmi";

import styled from "styled-components";

// Components
import { ActionCard } from "../components/ActionCard";
import { KeysCard } from "../components/KeysCard";
import { SettingsCard } from "../components/SettingsCard";

// Common Components
import { ConnectButton } from "../components/common/ConnectButton";
import { Footer } from "../components/common/Footer";
import { Header } from "../components/common/Header";
import { Section } from "../components/common/Section";

// Types
import {
  FKStealthSafeAddressGenerationParams,
  FKMetaStealthKeyPair,
} from "../types";

const SPage = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 24px;
  padding-left: 24px;
`;
const SKeyAndSettingsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
`;

export const Index = () => {
  const [keys, setKeys] = useState<FKMetaStealthKeyPair>();
  const [settings, setSettings] =
    useState<FKStealthSafeAddressGenerationParams>({
      chainId: 0,
      startNonce: 0,
      endNonce: 5,
      safeVersion: "1.3.0",
      useDefaultAddress: true,
    });

  const { isConnected } = useAccount();

  return (
    <SPage>
      <Header>
        <h1>Stealth Account Recovery Assistant (PoC)</h1>
        <ConnectButton />
      </Header>
      <Section>
        {!keys && (
          <ActionCard onKeyGenerated={setKeys} isConnected={isConnected} />
        )}
        {keys && isConnected && (
          <SKeyAndSettingsContainer>
            <KeysCard keys={keys} settings={settings} />
            <SettingsCard onSettingsChanged={setSettings} />
          </SKeyAndSettingsContainer>
        )}
      </Section>
      <Footer />
    </SPage>
  );
};
