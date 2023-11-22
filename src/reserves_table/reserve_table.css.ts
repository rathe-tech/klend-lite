import { globalStyle, style } from "@vanilla-extract/css";

export const table = style({
  border: "1px solid green",
  padding: "1em",
  width: "100%",
});

export const disabled = style({
  opacity: 0.5,
  pointerEvents: "none",
});

globalStyle(`${table} th, td`, {
  padding: "0.25em 0.75em",
  textAlign: "right",
});

globalStyle(`${table} th:first-child, td:first-child`, {
  textAlign: "left",
});