import { style } from "@vanilla-extract/css";
import { lightGray, primaryGreenColor } from "../../../../theme/constants";

export const stats = style({
  display: "flex",
  flex: 1,
  paddingTop: "8px",
  paddingBottom: "8px",
  columnGap: "18px",
});

export const statItem = style({
  display: "flex",
  alignItems: "center",
  columnGap: "6px",
});

export const title = style({
  fontSize: "16px",
  fontWeight: "bold",
  color: primaryGreenColor
});

export const value = style({
  fontSize: "16px",
  fontWeight: "bold",
  color: lightGray,
});