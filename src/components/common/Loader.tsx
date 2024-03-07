import styled from "styled-components";

const SLoader = styled.div<{ size: string }>`
  border: ${(props) =>
    props.size === "small"
      ? "2px solid #bbbbbb"
      : props.size === "medium"
      ? "8px solid #bbbbbb"
      : "16px solid #bbbbbb"};
  border-top: ${(props) =>
    props.size === "small"
      ? "2px solid black"
      : props.size === "medium"
      ? "8px solid black"
      : "16px solid black"};
  border-radius: 50%;
  width: ${(props) =>
    props.size === "small"
      ? "16px"
      : props.size === "medium"
      ? "32px"
      : "64px"};
  height: ${(props) =>
    props.size === "small"
      ? "16px"
      : props.size === "medium"
      ? "32px"
      : "64px"};
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface ComponentProps {
  size: "small" | "medium" | "large";
}

export const Loader = (props: ComponentProps) => {
  return <SLoader {...props} />;
};
