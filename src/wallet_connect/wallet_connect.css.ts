import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  justifyContent: "right",
  alignItems: "center",
  marginTop: "1em",
});

export const connectButton = style({
  marginLeft: "1em",
  padding: "0.5em 0.75em",
  fontSize: "18px",
});