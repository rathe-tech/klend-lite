import { style } from "@vanilla-extract/css";
import { lightGray } from "../../theme/constants";

export const root = style({
  display: "fex",
});

export const item = style({
  marginRight: "2em",
  fontSize: "16px",
});

export const active = style({
  cursor: "not-allowed",
  color: lightGray,
  textDecoration: "none",
  fontWeight: "bold",
});