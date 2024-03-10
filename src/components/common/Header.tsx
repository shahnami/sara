import { Container } from "@mantine/core";
import classes from "@css/header.module.css";

interface ComponentProps {}

export const Header = (props: React.PropsWithChildren<ComponentProps>) => {
  return (
    <header className={classes.header}>
      <Container className={classes.container}>{props.children}</Container>
    </header>
  );
};
