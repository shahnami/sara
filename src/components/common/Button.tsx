import styled from "styled-components";

// Components
import { Loader } from "./Loader";

const SButton = styled.button<{
  $type: string;
  disabled?: boolean;
  $fullwidth?: boolean;
}>`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  color: ${(props) =>
    props.disabled
      ? "gray"
      : props.$type === "primary"
      ? "white"
      : props.$type === "secondary"
      ? "black"
      : "black"};
  background: ${(props) =>
    props.disabled
      ? props.$type === "primary"
        ? "#AAAAAA"
        : "#EFEFEF"
      : props.$type === "primary"
      ? "black"
      : "#EFEFEF"};

  font-size: 16px;
  padding: 16px;
  border: 1px solid #efefef;
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  width: ${(props) => (props.$fullwidth ? "100%" : "auto")};
`;

interface ComponentProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  type: "primary" | "secondary" | "tertiary";
  fullWidth?: boolean;
}

export const Button = (props: ComponentProps) => {
  return (
    <SButton
      $fullwidth={props.fullWidth}
      $type={props.type}
      title={props.title}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
    >
      {props.title}
      {props.loading && <Loader size="small" />}
    </SButton>
  );
};
