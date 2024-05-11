import { vars } from "@theme/vars.css";
import { style } from "@vanilla-extract/css";

export const layout = style({
  zIndex: "9999",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "end",
  rowGap: "0.5em",
  padding: "1em",
});

export const notification = style({
  border: `1px solid ${vars.color.borderPrimary}`,
  background: vars.color.backgroundPrimary,
  pointerEvents: "all",
  minWidth: "320px",
  padding: "1.5em",
  position: "relative",
});

export const close = style({
  position: "absolute",
  fontSize: "20px",
  right: "4px",
  top: "0px",
  cursor: "pointer",
});