import { useState } from "react";

import { Box, Button, Modal, PinInput, Notification } from "@mantine/core";
import { IconSignature } from "@tabler/icons-react";
import { useAccount, useSignMessage } from "wagmi";
import { getMessageToSign } from "@utils/fluidkey";

interface ComponentProps {
  open: boolean;
  onSigned: (signature: `0x${string}`) => void;
  onError?: (error: any) => void;
  onClose: () => void;
}

export const PinCodeModal = (props: ComponentProps) => {
  const [error, setError] = useState<string>();
  const [pin, setPin] = useState<string>();

  const { signMessage } = useSignMessage();
  const { isConnected, address } = useAccount();

  const PIN_LENGTH = 4;

  const onRequestSignature = () => {
    if (isConnected && address && pin) {
      signMessage(
        {
          message: getMessageToSign({ address: address, secret: pin }),
        },
        {
          onSuccess: (data) => {
            setPin(undefined);
            setError(undefined);
            props.onSigned(data);
            props.onClose();
          },
          onError: (error) => {
            if (props.onError) props.onError(error);
            setError(error.message);
          },
        }
      );
    }
  };

  const onPinChange = (value: string) => {
    if (value.length !== PIN_LENGTH) {
      setPin(undefined);
    }
  };

  const onPinComplete = (value: string) => {
    setPin(value);
  };

  return (
    <Modal
      title="Enter your 4-digit PIN"
      opened={props.open}
      onClose={props.onClose}
      centered={true}
    >
      <Box
        style={{
          padding: "var(--u3)",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: "var(--u4)",
        }}
      >
        <PinInput
          length={PIN_LENGTH}
          inputMode="decimal"
          type="number"
          autoFocus={true}
          size="lg"
          onChange={onPinChange}
          onComplete={onPinComplete}
        />

        {error && (
          <Notification withCloseButton={false} withBorder color="red">
            {error}
          </Notification>
        )}

        <Button
          fullWidth={true}
          className="button"
          variant="filled"
          color="#191919"
          leftSection={<IconSignature size={14} />}
          onClick={onRequestSignature}
          disabled={!pin}
        >
          Sign Message
        </Button>
      </Box>
    </Modal>
  );
};
