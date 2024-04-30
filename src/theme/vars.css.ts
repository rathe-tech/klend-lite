import { createGlobalTheme } from "@vanilla-extract/css";

const mobileMax = "900px";

export const mobileMediaQuery = `(max-width: ${mobileMax})`;

export const vars = createGlobalTheme(":root", {
  color: {
    accentColor: "#00cc00",
    accentColorDimmed: "#00cc0020",

    labelPrimary: "#fff",
    labelSecondary: "#9a9cab",
    labelTertiary: "#bbb",
    labelQuaternary: "#aaa",

    backgroundPrimary: "#0d1117",
    backgroundSecondary: "#161b22",

    borderPrimary: "#30363d",
    borderPrimaryDisabled: "#30363d40",
    borderAccent: "#00cc0040",

    buttonDefaultBackgroundRest: "#21262d",
    buttonDefaultBackgroundHover: "#292e36",
    buttonDefaultBackgroundActive: "#31363e",

    buttonDefaultBackgroundDisabled: "#21262d40",
  },
  desktop: {
    containerWidth: "1280px",
    containerOffset: "16px",
  },
  mobile: {
    containerOffset: "12px",
  }
});