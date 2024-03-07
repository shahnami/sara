import { useState } from "react";
import { useSignMessage, useAccount } from "wagmi";

// Common Components
import { Modal } from "./common/Modal";
import { SecretPinInput } from "./common/PinInput";
import { Note } from "./common/Note";

// Utils
import { getMessageToSign } from "../utils/fluidkey";

interface ComponentProps {
  show: boolean;
  onSigned: (signature: `0x${string}`) => void;
  onError?: (error: any) => void;
  onClose: () => void;
}

export const PinCodeModal = (props: ComponentProps) => {
  const [isValid, setValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [secretPin, setSecretPin] = useState<string | undefined>(undefined);

  const { signMessage } = useSignMessage();
  const { isConnected, address } = useAccount();

  const PIN_LENGTH = 4;

  const onCloseModal = () => {
    props.onClose();
  };

  const onSubmitModal = () => {
    if (isValid && isConnected && address && secretPin) {
      signMessage(
        {
          message: getMessageToSign({ address: address, secret: secretPin }),
        },
        {
          onSuccess: (data) => {
            props.onSigned(data);
          },
          onError: (error) => {
            if (props.onError) props.onError(error);
            setErrorMessage(error.message);
          },
        }
      );
    }
  };

  const onSecretInputChange = (value: string, _: number) => {
    if (value.length === PIN_LENGTH) {
      setValid(true);
    } else {
      setValid(false);
    }
  };

  const onSecretInputComplete = (value: string, _: number) => {
    setSecretPin(value);
  };

  return (
    <Modal
      cancelLabel="Cancel"
      submitLabel="Sign"
      show={props.show}
      onClose={onCloseModal}
      onSubmit={onSubmitModal}
      isValid={isValid}
    >
      <h1>Enter your PIN code</h1>
      <SecretPinInput
        length={PIN_LENGTH}
        onChange={onSecretInputChange}
        onComplete={onSecretInputComplete}
      />
      <Note show={!!errorMessage} type="error" note={errorMessage} />
    </Modal>
  );
};
