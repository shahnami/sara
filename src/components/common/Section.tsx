import styled from "styled-components";

const SContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  height: 70vh;
`;

interface ComponentProps {}

export const Section = (props: React.PropsWithChildren<ComponentProps>) => {
  return <SContainer>{props.children}</SContainer>;
};
