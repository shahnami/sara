import { Container } from "@mantine/core";
import classes from "@css/section.module.css";

interface ComponentProps {}

export const Section = (props: React.PropsWithChildren<ComponentProps>) => {
  return (
    <section className={classes.section}>
      <Container className={classes.container}>{props.children}</Container>
    </section>
  );
};
