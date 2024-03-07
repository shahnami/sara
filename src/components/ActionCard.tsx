import { useEffect, useState } from "react";
import { generateKeysFromSignature } from "@fluidkey/stealth-account-kit";

// Components
import { PinCodeModal } from "./PinCodeModal";

// Common Components
import { Button } from "./common/Button";

// Types
import { Address, FKMetaStealthKeyPair } from "../types";

interface ComponentProps {
  onKeyGenerated: (key: FKMetaStealthKeyPair) => void;
  isConnected: boolean;
}

export const ActionCard = (props: ComponentProps) => {
  const [showModal, setShowModal] = useState(false);
  const [signature, setSignature] = useState<Address>();

  useEffect(() => {
    try {
      if (signature) {
        props.onKeyGenerated(generateKeysFromSignature(signature));
      }
    } catch (e) {
      console.error(e);
    }
  }, [signature]);

  const onHandleSignature = (signature: `0x${string}`) => {
    setSignature(signature);
    setShowModal(false);
  };
  const onHandleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div>
      <PinCodeModal
        show={showModal}
        onClose={onHandleModalClose}
        onSigned={onHandleSignature}
      />
      <Button
        type="primary"
        title="Generate Keys"
        onClick={() => setShowModal(true)}
        disabled={!props.isConnected}
      />
    </div>
  );
};
