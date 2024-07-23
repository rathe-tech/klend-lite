import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const appBar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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

export const paledText = style({
  color: vars.color.labelSecondary,
});