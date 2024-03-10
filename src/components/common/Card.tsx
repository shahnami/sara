import { Box } from "@mantine/core";
import classes from "@css/card.module.css";

interface ComponentProps {
  hidden?: boolean;
}

export const Card = (props: React.PropsWithChildren<ComponentProps>) => {
  return (
    <Box
      style={{
        display: `${props.hidden ? "none" : "flex"}`,
      }}
      className={classes.box}
    >
      {props.children}
    </Box>
  );
};
