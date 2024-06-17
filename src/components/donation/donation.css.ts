import { style } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "@theme/vars.css";

export const h1 = style({
  fontSize: "20px",
})

export const p = style({
  paddingTop: "1em",
});

export const ul = style({
  paddingLeft: "1.75em",
});

export const li = style({
  padding: "0.25em",
});

export const donationWrapper = style({
  backgroundColor: vars.color.accentColorDimmed,
  border: `1px solid ${vars.color.borderAccent}`,
  display: "flex",
  alignItems: "center",
  columnGap: "8px",
  fontSize: "14px",
  marginTop: "1.5em",

  padding: `14px ${vars.desktop.containerOffset}`,
  "@media": {
    [mobileMediaQuery]: {
      padding: `14px ${vars.mobile.containerOffset}`,
    }
  }
});

export const wallet = style({
  textDecoration: "underline dashed",
  textDecorationThickness: "1px",
  textUnderlineOffset: "0.2em",
  fontWeight: "bold",
  cursor: "pointer",
});