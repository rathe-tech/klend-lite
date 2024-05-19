import { vars } from "@theme/vars.css";
import { style } from "@vanilla-extract/css";

export const submitButton = style({
  fontSize: "15px",
  padding: "12px 0",
  display: "flex",
  columnGap: "10px",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: vars.color.buttonSecondaryBackgroundRest,
  border: "none",
  ":active": {
    backgroundColor: vars.color.buttonSecondaryBackgroundActive,
  },
  ":hover": {
    backgroundColor: vars.color.buttonSecondaryBackgroundHover,
  },
  ":disabled": {
    backgroundColor: vars.color.buttonSecondaryBackgroundDisabled,
    color: vars.color.labelTertiary,
  }
});