import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const marketList = style({
  display: "flex",
  columnGap: "24px",
});

export const marketItem = style({
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  color: vars.color.labelSecondary,
  whiteSpace: "pre",
  ":hover": {
    color: vars.color.labelPrimary,
  }
});

export const marketItemActive = style([marketItem, {
  textDecoration: "none",
  color: vars.color.labelPrimary,
  borderBottom: `2px solid ${vars.color.accentColor}`,
}]);