import { globalStyle, style } from "@vanilla-extract/css";

globalStyle("html, body", {
  backgroundColor: "black",
  color: "green",
  margin: 0,
  padding: 0,
  fontFamily: "sans-serif"
});

globalStyle("button", {
  border: "1px solid green",
  color: "green",
  background: "none",
  padding: "0.25em 0.75em",
  cursor: "pointer",
});

globalStyle("button:disabled", {
  opacity: 0.5,
  cursor: "not-allowed",
})

export const app = style({
  margin: "0 auto",
  width: "1280px",
});

export const controlsContainer = style({
  borderTop: "1px solid green",
  borderBottom: "1px solid green",
  margin: "1em 0",
  display: "flex",
  padding: "0.5em 0",
});

export const obligationContainer = style({
  display: "flex",
});

export const updateMarketButton = style({
  marginLeft: "auto",
  fontSize: "16px",
});