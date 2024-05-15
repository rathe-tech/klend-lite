import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

const base = style({
  pointerEvents: "all",
  width: "320px",
  padding: "1.5em",
  position: "relative",
  background: vars.color.backgroundPrimary,
  border: `1px solid ${vars.color.borderPrimary}`,
  ":before": {
    content: "' '",
    position: "absolute",
    width: "2px",
    top: 0,
    left: 0,
    bottom: 0,
  }
});

export const notification = styleVariants({
  info: [base, {
    ":before": {
      backgroundColor: vars.color.borderPrimary,
    }
  }],
  error: [base, {
    ":before": {
      backgroundColor: vars.color.errorColor,
    }
  }],
  success: [base, {
    ":before": {
      backgroundColor: vars.color.accentColor,
    }
  }],
});

export const content = style({
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const close = style({
  position: "absolute",
  right: "4px",
  top: "4px",
  cursor: "pointer",
  width: "14px",
  height: "14px",
  ":before": {
    transform: "rotate(45deg)",
    position: "absolute",
    left: "6px",
    content: "' '",
    height: "15px",
    width: "1.5px",
    backgroundColor: vars.color.labelPrimary,
  },
  ":after": {
    transform: "rotate(-45deg)",
    position: "absolute",
    left: "6px",
    content: "' '",
    height: "15px",
    width: "1.5px",
    backgroundColor: vars.color.labelPrimary,
  }
});