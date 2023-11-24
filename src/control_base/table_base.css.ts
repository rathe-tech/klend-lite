import { globalStyle, style } from "@vanilla-extract/css";
import { lightGray, tertiaryGreenColor } from "../theme/constants";

export const table = style({
  border: `1px solid ${tertiaryGreenColor}`,
  padding: "6px",
  width: "100%",
  alignSelf: "start",
});

globalStyle(`${table} th, td`, {
  padding: "4px",
  textAlign: "right",
});

globalStyle(`${table} th`, {
  paddingTop: "8px",
  paddingBottom: "8px",
  fontSize: "16px",
});

globalStyle(`${table} th:first-child, td:first-child`, {
  textAlign: "left",
});

globalStyle(`${table} td`, {
  color: lightGray,
});

globalStyle(`${table} td:first-child`, {
  fontWeight: "bold",
});