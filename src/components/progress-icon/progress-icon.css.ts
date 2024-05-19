import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const base = style({
  width: "14px",
  height: "14px",
  borderRadius: "7px",
  animation: `${rotate} 1s linear infinite`,
});

export const circle = styleVariants({
  accent: [base, {
    border: `2px solid ${vars.color.accentColor}`,
    borderTopColor: "transparent",
  }],
  default: [base, {
    border: `2px solid ${vars.color.labelTertiary}`,
    borderTopColor: "transparent",
  }],
});