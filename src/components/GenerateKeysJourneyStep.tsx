import { useEffect, useState } from "react";
import { generateKeysFromSignature } from "@fluidkey/stealth-account-kit";
import { Box, Button, Collapse, Textarea } from "@mantine/core";
import { IconArrowLeft, IconKey } from "@tabler/icons-react";

import { StepContent } from "@components/StepContent";
import { PinCodeModal } from "@components/PinCodeModal";

import { Address, FluidKeyMetaStealthKeyPair } from "@typing/index";
import { useSignMessage } from "wagmi";

interface ComponentProps {
  onKeys: (keys: FluidKeyMetaStealthKeyPair) => void;
  onBack: () => void;
}

export const GenerateKeysJourneyStep = (props: ComponentProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [signature, setSignature] = useState<Address>();
  const [customMessage, setCustomMessage] = useState<string>();

  const { signMessage } = useSignMessage();

  useEffect(() => {
    try {
      if (signature) {
        props.onKeys(generateKeysFromSignature(signature));
      }
    } catch (e) {
      console.error(e);
    }
  }, [signature]);

  const handleCustomSignature = () => {
    if (customMessage) {
      signMessage(
        {
          message: customMessage,
        },
        {
          onSuccess: (data) => {
            setSignature(data);
          },
        }
      );
    }
  };

  return (
    <>
      <PinCodeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSigned={(signature) => setSignature(signature)}
      />
      <StepContent>
        Click on the button below. You will be prompted to enter your PIN code
        and sign a message. This unique signature will be used to derive your
        stealth meta address.
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
            onClick={() => props.onBack()}
          >
            Back
          </Button>
          <Button
            className="button"
            variant="filled"
            color="#191919"
            size="md"
            leftSection={<IconKey size={14} />}
            onClick={() =>
              customMessage ? handleCustomSignature() : setOpenModal(true)
            }
          >
            Generate Stealth Keys
          </Button>

          <Button
            variant="subtle"
            onClick={() => setOpenSettings(!openSettings)}
          >
            Advanced settings
          </Button>
        </Box>
      </StepContent>
      <br />
      <StepContent hidden={!openSettings}>
        <Collapse
          in={openSettings}
          transitionDuration={250}
          transitionTimingFunction="linear"
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "var(--u1)",
            }}
          >
            <b>Sign a custom message</b>
            <Textarea
              autosize={true}
              minRows={5}
              style={{ width: "50vw" }}
              onChange={(event) => setCustomMessage(event.target.value)}
            />
          </Box>
        </Collapse>
      </StepContent>
    </>
  );
};
