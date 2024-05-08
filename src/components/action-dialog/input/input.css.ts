import { vars } from "@theme/vars.css";
import { style } from "@vanilla-extract/css";

export const root = style({
  border: `1px solid ${vars.color.borderPrimary}`,
  cursor: "text",
  borderRadius: "4px",
});

export const buttonWrapper = style({});

export const inputWrapper = style({
  display: "flex",
  flexDirection: "column",
  rowGap: "0.75em",
  padding: "1em",
});

export const mainLine = style({
  display: "flex",
  alignItems: "center",
  columnGap: "0.75em",
});

export const input = style({
  flex: 1,
  border: "none",
  fontSize: "18px",
  fontWeight: "bold",
  textAlign: "right",
  outline: "none",
  backgroundColor: "transparent",
  color: vars.color.labelPrimary,
  WebkitAppearance: "none",
  "::-webkit-outer-spin-button": {
    appearance: "none",
    margin: 0
  },
  "::-webkit-inner-spin-button": {
    appearance: "none",
    margin: 0
  },
  "MozAppearance": "textfield",
});

export const symbol = style({
  fontSize: "18px",
  fontWeight: "bold",
});

export const auxLine = style({
  display: "flex",
  justifyContent: "flex-end",
  color: vars.color.labelSecondary,
});