import styled from "styled-components";
import { Button } from "./Button";

const SContainer = styled.div<{ $show: boolean }>`
  display: ${(props) => (props.$show ? "flex" : "none")};
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  border: 1px solid black;
  position: absolute;
  width: 25vw;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 24px;
`;

const SContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 32px;
`;

interface ComponentProps {
  show: boolean;
  isValid: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel: string;
}

export const Modal = (props: React.PropsWithChildren<ComponentProps>) => {
  const onSubmit = () => {
    props.onSubmit();
  };
  const onClose = () => {
    props.onClose();
  };
  return (
    <SContainer $show={props.show}>
      <SContentContainer>{props.children}</SContentContainer>
      <SButtonContainer>
        <Button
          fullWidth={true}
          type="secondary"
          onClick={onClose}
          title={props.cancelLabel}
        />
        <Button
          fullWidth={true}
          type="primary"
          onClick={onSubmit}
          title={props.submitLabel}
          disabled={!props.isValid}
        />
      </SButtonContainer>
    </SContainer>
  );
};
