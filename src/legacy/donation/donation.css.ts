import { style } from "@vanilla-extract/css";
import { tertiaryGreenColor, lightGray } from "../../theme/constants";

export const root = style({
  backgroundColor: tertiaryGreenColor,
  padding: "16px",
  color: "white",
});

export const title = style({
  fontSize: "16px",
});

export const wallet = style({
  fontSize: "16px",
  marginTop: "0.5em",
  textDecoration: "underline dashed",
  textDecorationThickness: "2px",
  textUnderlineOffset: "0.2em",
  cursor: "pointer",
});