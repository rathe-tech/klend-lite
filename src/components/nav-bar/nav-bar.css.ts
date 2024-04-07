import { style } from "@vanilla-extract/css";
import { version } from "./../../../package.json";
import { tertiaryGreenColor } from "./../../theme/constants";


export const navBar = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderBottom: `1px solid ${tertiaryGreenColor}`,
  height: "60px",
});

export const navBarBody = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "1280px",
});

export const appTitle = style({
  flex: 1,
  fontSize: "24px",
  fontWeight: "bold",
});