import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const root = style({
  display: "flex",
  flexDirection: "row",
  columnGap: "6px",
  fontSize: "14px",
  padding: "6px 0",
  justifyContent: "space-between",
});

export const label = style({
  color: vars.color.labelSecondary,
});

export const value = style({
  color: vars.color.labelPrimary,
  fontWeight: "bold",
});