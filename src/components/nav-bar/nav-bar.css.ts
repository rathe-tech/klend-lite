import { style } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "../../theme/vars.css";

export const navBar = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  top: 0,
  width: "100%",
  height: vars.desktop.navBarHeight,
  backgroundColor: vars.color.backgroundPrimary,
  "@media": {
    [mobileMediaQuery]: {
      height: vars.mobile.navBarHeight,
    }
  }
});

export const navBarBody = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: vars.desktop.containerWidth,
  padding: `0 ${vars.desktop.containerOffset}`,
  "@media": {
    [mobileMediaQuery]: {
      width: "100%",
      padding: `0 ${vars.mobile.containerOffset}`,
    }
  }
});

export const appTitle = style({
  flex: 1,
  fontSize: "24px",
  fontWeight: "bold",
});