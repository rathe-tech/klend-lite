import { style, styleVariants } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "@theme/vars.css";

const base = style({
  display: "flex",
  justifyContent: "center",
});

export const section = styleVariants({
  header: [base, {
    borderBottom: `1px solid ${vars.color.borderPrimary}`,
  }],
  body: [base],
});

export const wrapper = style({
  width: vars.desktop.containerWidth,
  padding: `12px ${vars.desktop.containerOffset}`,
  "@media": {
    [mobileMediaQuery]: {
      width: "100%",
      padding: `12px ${vars.mobile.containerOffset}`,
    },
  },
});