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

export const input = style({
  fontSize: "16px",
  padding: "0.5em 0.75em",
  outline: "none",
  textAlign: "right",
  backgroundColor: vars.color.backgroundPrimary,
  border: `1px solid ${vars.color.borderPrimary}`,
  color: vars.color.labelPrimary,
  borderRadius: "4px",
  ":focus": {
    outline: `2px solid ${vars.color.accentColor}`,
  },
});