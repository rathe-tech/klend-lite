import { vars } from "@theme/vars.css";
import { style } from "@vanilla-extract/css";

export const root = style({
  border: `1px solid ${vars.color.borderPrimary}`,
  borderLeft: 0,
  width: "420px",
  padding: "0.5em",
  paddingLeft: "0.25em",
});