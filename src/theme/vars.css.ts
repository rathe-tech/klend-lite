import { createGlobalTheme } from "@vanilla-extract/css";

const mobileMax = "900px";

export const mobileMediaQuery = `(max-width: ${mobileMax})`;

export const vars = createGlobalTheme(":root", {
  color: {
    labelPrimary: "#fff",
    labelSecondary: "#ddd",
    labelTertiary: "#bbb",
    labelQuaternary: "#aaa",

    backgroundPrimary: "#000",
  },
  desktop: {
    containerWidth: "1280px",
    containerOffset: "16px",
    navBarHeight: "60px",
  },
  mobile: {
    containerOffset: "12px",
    navBarHeight: "60px",
  }
});