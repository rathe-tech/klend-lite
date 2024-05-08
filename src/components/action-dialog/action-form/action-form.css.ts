import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const form = style({
  display: "flex",
  flexDirection: "column",
  padding: "1.5em",
  rowGap: "1em",
  justifyContent: "end",
});

export const label = style({
  textAlign: "right",
  fontSize: "14px",
  color: vars.color.labelSecondary,
});