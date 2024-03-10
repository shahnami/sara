import { Container } from "@mantine/core";

interface ComponentProps {
  hidden?: boolean;
}

export const StepContent = (props: React.PropsWithChildren<ComponentProps>) => {
  return (
    <Container
      style={{
        display: `${props.hidden ? "none" : "flex"}`,
        flexDirection: "column",
        gap: "var(--u3)",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed var(--dark-gray)",
        width: "100%",
        padding: "var(--u3)",
        overflow: "hidden",
      }}
    >
      {props.children}
    </Container>
  );
};
