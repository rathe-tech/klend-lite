import { globalStyle, style } from "@vanilla-extract/css";

export const table = style({
  border: "1px solid green",
  padding: "0.75em",
  width: "100%",
  alignSelf: "start",
});

globalStyle(`${table} th, td`, {
  padding: "0.25em 0.75em",
  textAlign: "right",
});

globalStyle(`${table} th:first-child, td:first-child`, {
  textAlign: "left",
});