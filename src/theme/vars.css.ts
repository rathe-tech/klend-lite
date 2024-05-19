import { createGlobalTheme } from "@vanilla-extract/css";

const mobileMax = "900px";

export const mobileMediaQuery = `(max-width: ${mobileMax})`;

export const vars = createGlobalTheme(":root", {
  color: {
    accentColor: "#00cc00",
    accentColorDimmed: "#00cc0020",

    errorColor: "#cc0000",
    errorColorDimmed: "#cc000029",

    labelPrimary: "#fff",
    labelSecondary: "#9a9cab",
    labelTertiary: "#bbb",
    labelQuaternary: "#aaa",

    backgroundPrimary: "#0d1117",
    backgroundSecondary: "#161b22",

    borderPrimary: "#30363d",
    borderPrimaryDisabled: "#30363d40",
    borderAccent: "#00cc0040",

    buttonPrimaryBackgroundRest: "#21262d",
    buttonPrimaryBackgroundHover: "#292e36",
    buttonPrimaryBackgroundActive: "#31363e",
    buttonPrimaryBackgroundDisabled: "#21262d40",

    buttonSecondaryBackgroundRest: "#238636",
    buttonSecondaryBackgroundHover: "#29903b",
    buttonSecondaryBackgroundActive: "#2e9a40",
    buttonSecondaryBackgroundDisabled: "#105823",
  },
  desktop: {
    containerWidth: "1280px",
    containerOffset: "16px",
  },
  mobile: {
    containerOffset: "12px",
  }
});