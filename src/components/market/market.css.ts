import { style } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "@theme/vars.css";

export const market = style({
  display: "flex",
  justifyContent: "center",
});

export const marketBody = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: vars.desktop.containerWidth,
  padding: `12px ${vars.desktop.containerOffset}`,
  "@media": {
    [mobileMediaQuery]: {
      width: "100%",
      padding: `12px ${vars.mobile.containerOffset}`,
    }
  }
});

export const statsContainer = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginBottom: "12px",
});