import styled from "styled-components";

const SNote = styled.div<{
  $show: boolean;
  $type: string;
}>`
  display: ${(props) => (props.$show ? "block" : "none")};
  color: black;
  background: ${(props) =>
    props.$type === "error"
      ? "#e9aaaa"
      : props.$type === "warning"
      ? "#fcc29c"
      : "#a3c9ea"};

  font-size: 16px;
  padding: 16px;
  border: 1px solid #efefef;
  border-radius: 8px;
  width: 100%;
`;

interface ComponentProps {
  note?: string;
  show: boolean;
  type: "error" | "warning" | "info";
}

export const Note = (props: ComponentProps) => {
  return (
    <SNote $show={props.show} $type={props.type}>
      {props.note}
    </SNote>
  );
};
