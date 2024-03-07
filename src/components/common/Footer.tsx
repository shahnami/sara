import styled from "styled-components";

const SContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding: 24px;
  border-top: 1px dashed #efefef;
`;

interface ComponentProps {}

export const Footer = (props: React.PropsWithChildren<ComponentProps>) => {
  return <SContainer>{props.children}</SContainer>;
};
