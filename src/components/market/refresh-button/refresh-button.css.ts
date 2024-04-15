import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../theme/vars.css";

export const refreshButton = style({
  display: "flex",
  fontSize: "14px",
  columnGap: "10px",
  justifyContent: "center",
  alignItems: "center",
  padding: "8px 12px",
});

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const circle = style({
  width: "14px",
  height: "14px",
  border: `2px solid ${vars.color.accentColor}`,
  borderRadius: "7px",
  borderTopColor: "transparent",
  animation: `${rotate} 1s linear infinite`,
});