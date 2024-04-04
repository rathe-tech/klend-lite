import { globalStyle } from "@vanilla-extract/css";
import {
  primaryDarkColor,
  primaryGreenColor,
  secondaryGreenColor,
  white
} from "./constants";

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
  backgroundColor: primaryDarkColor,
  color: primaryGreenColor,
  margin: 0,
  padding: 0,
});

globalStyle("#root", {
  width: "100%",
  height: "100%",
});

globalStyle("a", {
  color: primaryGreenColor,
})

globalStyle("button", {
  border: `1px solid ${secondaryGreenColor}`,
  color: secondaryGreenColor,
  background: primaryDarkColor,
  padding: "0.25em 0.75em",
  cursor: "pointer",
  borderRadius: "4px",
});

globalStyle("button:enabled:hover", {
  backgroundColor: primaryGreenColor,
  color: white,
});

globalStyle("button:disabled", {
  opacity: 0.25,
  cursor: "not-allowed",
});