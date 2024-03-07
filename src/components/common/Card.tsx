import styled from "styled-components";

const SContainer = styled.div<{ $fullwidth?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  border: 1px solid gray;
  border-radius: 24px;
  padding: 24px;
  background-color: white;
  width: ${(props) => (props.$fullwidth ? "100%" : "auto")};
`;

const SHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: flex-start;
  border-bottom: 1px solid gray;
  width: 100%;
`;

const SContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding-top: 16px;
  gap: 16px;
`;

interface ComponentProps {
  title: string;
  fullWidth?: boolean;
}

export const Card = (props: React.PropsWithChildren<ComponentProps>) => {
  return (
    <SContainer $fullwidth={props.fullWidth}>
      <SHeader>
        <h1>{props.title}</h1>
      </SHeader>
      <SContent>{props.children}</SContent>
    </SContainer>
  );
};
