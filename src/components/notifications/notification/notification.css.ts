import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

const base = style({
  pointerEvents: "all",
  width: "320px",
  padding: "1.5em",
  position: "relative",
});

export const notification = styleVariants({
  info: [base, {
    background: vars.color.backgroundPrimary,
    border: `1px solid ${vars.color.borderPrimary}`,
  }],
  error: [base, {
    background: vars.color.errorColorDimmed,
    border: `1px solid ${vars.color.errorColor}`,
  }],
  success: [base, {
    backgroundColor: vars.color.accentColorDimmed,
    border: `1px solid ${vars.color.borderAccent}`,
  }],
});

export const content = style({
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const close = style({
  position: "absolute",
  fontSize: "20px",
  right: "4px",
  top: "0px",
  cursor: "pointer",
});