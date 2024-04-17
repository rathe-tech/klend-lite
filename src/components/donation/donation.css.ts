import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const donation = style({
  backgroundColor: vars.color.accentColorDimmed,
  width: "100%",
  padding: `${vars.desktop.containerOffset}`,
  display: "flex",
  columnGap: "8px",
  fontSize: "14px",
  marginBottom: "12px",
  border: `1px solid ${vars.color.borderAccent}`,
});

export const wallet = style({
  textDecoration: "underline dashed",
  textDecorationThickness: "1px",
  textUnderlineOffset: "0.2em",
  fontWeight: "bold",
  cursor: "pointer",
});