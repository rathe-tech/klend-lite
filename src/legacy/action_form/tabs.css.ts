import { style } from "@vanilla-extract/css";
import { primaryDarkColor, secondaryDarkColor, tertiaryGreenColor, white } from "../../theme/constants";

export const tabs = style({
  display: "flex",
});

export const item = style({
  fontSize: "16px",
  cursor: "pointer",
  flex: 1,
  display: "flex",
  fontWeight: 700,
  justifyContent: "center",
  alignItems: "center",
  padding: "1em 0",
  backgroundColor: secondaryDarkColor,
  borderBottom: `1px solid ${tertiaryGreenColor}`,
});

export const active = style({
  color: white,
  backgroundColor: primaryDarkColor,
  borderBottom: `1px solid ${primaryDarkColor}`,
  borderLeft: `1px solid ${tertiaryGreenColor}`,
  borderRight: `1px solid ${tertiaryGreenColor}`,
  ":first-child": {
    borderLeft: "none"
  },
  ":last-child": {
    borderRight: "none"
  },
});