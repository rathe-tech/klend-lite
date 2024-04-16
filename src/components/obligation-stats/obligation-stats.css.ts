import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const stats = style({
  display: "flex",
  columnGap: "24px",
  fontSize: "16px",
});

export const statItem = style({
  display: "flex",
  columnGap: "6px",
});

export const statLabel = style({
  color: vars.color.labelSecondary,
  fontWeight: "bold",
});

export const statValue = style({
  fontWeight: "bold",
});