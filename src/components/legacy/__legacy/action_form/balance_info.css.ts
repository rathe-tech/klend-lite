import { style } from "@vanilla-extract/css";
import { lightGray } from "../../../../theme/constants";

export const root = style({
  display: "flex",
  flexDirection: "row",
  columnGap: "6px",
  fontSize: "14px",
  justifyContent: "right",
});

export const value = style({
  color: lightGray,
})