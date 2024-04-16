import { style } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "@theme/vars.css";

export const marketSelect = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderBottom: `1px solid ${vars.color.borderPrimary}`,
});

export const marketSelectBody = style({
  display: "flex",
  width: vars.desktop.containerWidth,
  padding: `12px ${vars.desktop.containerOffset}`,
  columnGap: "24px",
  "@media": {
    [mobileMediaQuery]: {
      width: "100%",
      padding: `12px ${vars.mobile.containerOffset}`,
    }
  }
});

export const marketItem = style({
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  color: vars.color.labelSecondary,
  ":hover": {
    color: vars.color.labelPrimary,
  }
});

export const marketItemActive = style([marketItem, {
  textDecoration: "none",
  color: vars.color.labelPrimary,
  borderBottom: `2px solid ${vars.color.accentColor}`,
}]);