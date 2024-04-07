import { globalStyle, style } from "@vanilla-extract/css";
import { lightGray, secondaryDarkColor, tertiaryGreenColor } from "../../../../theme/constants";

export const table = style({
  border: `1px solid ${tertiaryGreenColor}`,
  padding: "8px",
  width: "100%",
  borderSpacing: "unset",
  alignSelf: "start",
});

globalStyle(`${table} th, td`, {
  padding: "6px",
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

globalStyle(`${table} tr:hover`, {
  background: secondaryDarkColor,
});

globalStyle(`${table} td:first-child`, {
  fontWeight: "bold",
});