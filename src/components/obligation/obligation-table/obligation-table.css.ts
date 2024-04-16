import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const noPosition = style({
  ":hover": {
    backgroundColor: vars.color.backgroundPrimary,
  },
});

export const noPositionText = style({
  textAlign: "center !important" as any,
  fontWeight: "bold",
  paddingTop: "16px",
  paddingBottom: "16px",
  fontSize: "14px",
  color: vars.color.labelTertiary,
});

export const controls = style({
  display: "inline-flex",
  columnGap: "6px",
});

export const amount = style({
  color: vars.color.labelPrimary,
});

export const symbol = style({
  fontWeight: "bold",
});