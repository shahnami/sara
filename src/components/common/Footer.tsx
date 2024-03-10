import { Container } from "@mantine/core";
import classes from "@css/footer.module.css";

interface ComponentProps {}

export const Footer = (props: React.PropsWithChildren<ComponentProps>) => {
  return (
    <footer className={classes.footer}>
      <Container className={classes.container}>{props.children}</Container>
    </footer>
  );
};
