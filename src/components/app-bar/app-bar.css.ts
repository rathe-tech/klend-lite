import { style } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "@theme/vars.css";

export const appBar = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderBottom: `1px solid ${vars.color.borderPrimary}`,
});

export const appBarBody = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: vars.desktop.containerWidth,
  padding: `12px ${vars.desktop.containerOffset}`,
  "@media": {
    [mobileMediaQuery]: {
      width: "100%",
      padding: `12px ${vars.mobile.containerOffset}`,
    },
  },
});

export const appTitle = style({
  flex: 1,
  fontSize: "20px",
  fontWeight: "bold",
  textDecoration: "none",
  ":visited": {
    color: vars.color.labelPrimary,
  }
});

export const appControls = style({
  display: "flex",
  columnGap: "0.75em",
});

export const appDonateBase = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingLeft: "1.25em !important",
  paddingRight: "1.25em !important",
  fontSize: "14px",
  textDecoration: "none",
});

export const appDonate = [appDonateBase, "link-button"].join(" ");