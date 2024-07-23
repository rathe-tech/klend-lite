import { style } from "@vanilla-extract/css";
import { vars } from "@theme/vars.css";

export const overlay = style({
  position: "fixed",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  transition: "opacity linear 150ms",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(3px)",
  overflowY: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
});

export const dialog = style({
  marginTop: "120px",
  backgroundColor: vars.color.backgroundPrimary,
  display: "flex",
  flexDirection: "row",
  position: "relative",
});

export const formContainer = style({
  width: "520px",
  border: `1px solid ${vars.color.borderPrimary}`,
  padding: "1.5em",
});

export const formLine = style({
  display: "flex",
  flexDirection: "column",
  marginBottom: "1.5em",
  ":last-child": {
    marginBottom: 0,
  }
});

export const fieldTitle = style({
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "8px",
});

export const inputWrapper = style({
  alignItems: "center",
  display: "flex",
  columnGap: "0.25em",
  padding: "0.5em",
  border: `1px solid ${vars.color.borderPrimary}`,
  borderRadius: "4px",
  fontWeight: "bold",
  fontSize: "16px",
});

export const input = style({
  flex: 1,
  border: "none",
  textAlign: "right",
  outline: "none",
  fontWeight: "bold",
  fontSize: "16px",
  backgroundColor: "transparent",
  color: vars.color.labelPrimary,
  WebkitAppearance: "none",
  "::-webkit-outer-spin-button": {
    appearance: "none",
    margin: 0
  },
  "::-webkit-inner-spin-button": {
    appearance: "none",
    margin: 0
  },
  "MozAppearance": "textfield",
});

export const saveButton = style({
  fontSize: "16px",
});

export const nonScroll = style({
  overflow: "hidden !important",
});