import { useEffect, useState } from "react";
import { Box, Button, Stepper } from "@mantine/core";
import { useAccount, useChainId, useDisconnect } from "wagmi";

import { IconArrowLeft, IconDownload } from "@tabler/icons-react";

import { StepContent } from "@components/StepContent";
import { GenerateKeysJourneyStep } from "@components/GenerateKeysJourneyStep";
import { RecoverAddressesJourneyStep } from "@components/RecoverAddressesJourneyStep";

import { downloadCSV } from "@utils/index";
import { FluidKeyMetaStealthKeyPair } from "@typing/index";

import { defaultExportHeaders } from "./Journey.model";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface ComponentProps {
  onStepChanged: (step: number) => void;
  onStealthDataProcessed: (data: string[][]) => void;
}

export const Journey = (props: ComponentProps) => {
  const [keys, setKeys] = useState<FluidKeyMetaStealthKeyPair>();
  const [stealthAddressData, setStealthAddressData] = useState<string[][]>([
    defaultExportHeaders,
  ]);

  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();

  const determineActiveStep = () => {
    if (!isConnected) {
      props.onStepChanged(0);
      return 0;
    }
    if (stealthAddressData.length > 1) {
      props.onStepChanged(3);
      return 3;
    }
    if (keys) {
      props.onStepChanged(2);
      return 2;
    }
    props.onStepChanged(1);
    return 1;
  };

  useEffect(() => {
    if (stealthAddressData.length > 1) {
      props.onStealthDataProcessed(stealthAddressData);
    }
  }, [stealthAddressData]);

  return (
    <Stepper active={determineActiveStep()} allowNextStepsSelect={false}>
      <Stepper.Step label="First step" description="Connect your wallet">
        <StepContent>
          Start by clicking on the 'Connect Wallet' button to ensure the full
          functionality of the app. This step is essential to identify the
          specific address from which to recover the associated stealth
          addresses in your account.
          <ConnectButton />
        </StepContent>
      </Stepper.Step>
      <Stepper.Step label="Second step" description="Generate your keys">
        <GenerateKeysJourneyStep
          onKeys={(keys) => setKeys(keys)}
          onBack={() => disconnect()}
        />
      </Stepper.Step>
      <Stepper.Step
        label="Final step"
        description="Recover your stealth accounts"
      >
        <RecoverAddressesJourneyStep
          chainId={currentChainId}
          keys={keys}
          onStealthDataProcessed={(data) => setStealthAddressData(data)}
          onBack={() => setKeys(undefined)}
        />
      </Stepper.Step>
      <Stepper.Completed>
        <StepContent>
          You can now download your stealth addresses in CSV format. If you need
          to re-configure or make adjustments, you can return to the previous
          step or refresh the page to start over.
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "var(--u2)",
              width: "100%",
            }}
          >
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => setStealthAddressData([defaultExportHeaders])}
            >
              Back
            </Button>
            <Button
              className="button"
              variant="filled"
              color="#191919"
              size="md"
              leftSection={<IconDownload size={14} />}
              onClick={() => downloadCSV(currentChainId, stealthAddressData)}
            >
              Download Stealth Addresses
            </Button>
          </Box>
        </StepContent>
      </Stepper.Completed>
    </Stepper>
  );
};
