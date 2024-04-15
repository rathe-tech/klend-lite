import { globalStyle } from "@vanilla-extract/css";

import { vars } from "./vars.css";

globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: light)": {
      colorScheme: "light",
    },
    "(prefers-color-scheme: dark)": {
      colorScheme: "dark",
    },
  },
});

globalStyle("*", {
  boxSizing: "border-box",
  fontFamily: "monospace",
  WebkitFontSmoothing: "antialiased",
});

globalStyle("html, body", {
  backgroundColor: vars.color.backgroundPrimary,
  color: vars.color.labelPrimary,
  margin: 0,
  padding: 0,
});

globalStyle("#root", {
  width: "100%",
  height: "100%",
});

import "./button.css";
import "./table.css";
import "./wallet.css";