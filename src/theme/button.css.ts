import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./vars.css";

globalStyle("button", {
  padding: "0.5em 0.75em",
  borderRadius: "4px",
  color: vars.color.labelPrimary,
  background: vars.color.buttonPrimaryBackgroundRest,
  border: `1px solid ${vars.color.borderPrimary}`,
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.15s ease-in",
});

globalStyle("button:hover", {
  background: vars.color.buttonPrimaryBackgroundHover,
});

globalStyle("button:active", {
  background: vars.color.buttonPrimaryBackgroundActive,
});

globalStyle("button:disabled", {
  color: vars.color.labelSecondary,
  backgroundColor: vars.color.buttonPrimaryBackgroundDisabled,
  borderColor: vars.color.borderPrimaryDisabled,
  cursor: "not-allowed",
});
