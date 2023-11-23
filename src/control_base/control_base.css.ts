import { style } from "@vanilla-extract/css";

export const hidden = style({
  "display": "none !important"
});

export const disabled = style({
  opacity: 0.5,
  pointerEvents: "none",
});