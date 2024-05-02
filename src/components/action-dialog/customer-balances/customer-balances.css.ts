import { vars } from "@theme/vars.css";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  justifyContent: "space-between",
  marginTop: "0.8em",
  gap: "1em",
  flexWrap: "wrap",
});

export  const item = style({
  whiteSpace: "nowrap",
});

export const suffix = style({
  color: vars.color.labelSecondary,
  userSelect: "none",
  ":before": {
    content: "' '",
  },
});

export const prefix = style({
  color: vars.color.labelPrimary,
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationStyle: "dashed",
  textUnderlineOffset: "3px",
  textDecorationColor: vars.color.labelSecondary,
  ":hover": {
    textDecorationColor: vars.color.labelPrimary,
  },
});