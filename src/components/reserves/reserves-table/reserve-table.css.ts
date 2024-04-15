import { style } from "@vanilla-extract/css";
import { vars } from "../../../theme/vars.css";

export const symbol = style({
  fontWeight: "bold",
  color: vars.color.labelPrimary,
  ":hover": {
    textDecorationColor: vars.color.accentColor,
  },
});

export const delimiter = style({
  color: vars.color.labelSecondary,
});

export const sub = style({
  color: vars.color.labelSecondary,
  fontSize: "12px",
  marginTop: "0.35em",
});

export const controls = style({
  display: "inline-flex",
  columnGap: "6px",
});