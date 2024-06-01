import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const symbol = style({
  fontWeight: "bold",
  color: vars.color.labelPrimary,
  ":hover": {
    textDecorationColor: vars.color.accentColor,
  },
});

export const delimiter = style({
  color: vars.color.labelSecondary,
  fontSize: "12px",
  padding: "0 4px",
});

export const sub = style({
  color: vars.color.labelSecondary,
  fontSize: "12px",
  marginTop: "0.35em",
});

export const controls = style({
  display: "inline-flex",
  columnGap: "6px",
});

export const pausedControlsRow = style({
  borderTop: `1px solid ${vars.color.borderPrimary}`,
  borderBottom: `1px solid ${vars.color.borderPrimary}`,
});

export const pausedControlsWrapper = style({
  display: "flex",
  alignItems: "center",
  columnGap: "0.5em",
});

export const pausedLabel = style({
  fontSize: "16px",
  fontWeight: "bold",
  color: vars.color.labelSecondary,
});