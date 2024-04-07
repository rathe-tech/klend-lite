import { globalStyle } from "@vanilla-extract/css";
import { mobileMediaQuery } from "./vars.css";
import { tertiaryGreenColor } from "./constants";

// All buttons in wallet lib uses this class.
globalStyle(".wallet-adapter-button", {
  display: "flex",
  alignItems: "center",
  backgroundColor: "transparent",
  // border: "none",
  cursor: "pointer",
});

// Connect wallet button
globalStyle(".wallet-adapter-button-trigger", {
  display: "flex",
  alignItems: "center",
  height: "42px",
  fontSize: "16px",
  padding: "0 1.25em",
  // border: `1px solid ${tertiaryGreenColor}`,
  // color: vars.color.backgroundPrimary,
  // backgroundColor: vars.color.accentPrimary,
  // borderRadius: vars.desktop.buttonBorderRadius,
  transition: "all 0.15s ease-in",
  "@media": {
    [mobileMediaQuery]: {
      padding: "0 0.75em",
    }
  }
});

globalStyle(".wallet-adapter-button-trigger:hover", {
  // color: vars.color.labelPrimary,
  // backgroundColor: vars.color.accentSecondary,
});

// Connected wallet button
globalStyle(".wallet-adapter-dropdown .wallet-adapter-button-trigger", {
  // color: vars.color.labelPrimary,
  // backgroundColor: vars.color.backgroundPrimary,
  // border: `1px solid ${vars.color.backgroundQuaternary}`,
});

// Background to draw wallet on
globalStyle(".wallet-adapter-modal", {
  position: "fixed",
  overflowY: "auto",
  zIndex: 999,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0,
  transition: "opacity linear 150ms",
  background: "rgba(0, 0, 0, 0.9)",
});

// Modal window top level parent
globalStyle(".wallet-adapter-modal-overlay", {
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});

// Modal window container
globalStyle(".wallet-adapter-modal-container", {
  minHeight: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  // padding: `0 ${vars.desktop.containerOffset}`,
  "@media": {
    [mobileMediaQuery]: {
      display: "block",
      padding: 0,
    }
  }
});

globalStyle(".wallet-adapter-modal-wrapper", {
  position: "relative",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  margin: "0 auto",
  zIndex: 1050,
  maxWidth: "520px",
  // borderRadius: vars.desktop.buttonBorderRadius,
  // backgroundColor: vars.color.backgroundPrimary,
  border: `1px solid ${tertiaryGreenColor}`,
  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.6)",
  flex: 1,
  "@media": {
    [mobileMediaQuery]: {
      width: "100%",
      maxWidth: "initial",
      borderRadius: 0,
    }
  }
});

globalStyle(".wallet-adapter-modal-title", {
  // color: vars.color.labelPrimary,
  fontSize: "26px",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  padding: "48px 32px 0px 32px",
  marginTop: "16px",
  marginBottom: "16px",
  textAlign: "center",
})

globalStyle(".wallet-adapter-modal-list", {
  padding: "16px 16px",
  width: "100%",
  listStyle: "none",
  display: "grid",
  columnGap: "12px",
  rowGap: "12px",
});

globalStyle(".wallet-adapter-modal-list .wallet-adapter-button", {
  boxSizing: "border-box",
  width: "100%",
  borderRadius: "6px",
  padding: "16px",
  fontSize: "18px",
  // backgroundColor: vars.color.backgroundSecondary,
  // color: vars.color.labelPrimary,
  // border: `1px solid ${vars.color.backgroundTertiary}`,
});

globalStyle(".wallet-adapter-modal-list .wallet-adapter-button:hover", {
  // border: `1px solid ${vars.color.accentPrimary}`,
  transition: "border 0.25s ease-in",
});

globalStyle(".wallet-adapter-modal-list .wallet-adapter-button span", {
  marginLeft: "auto",
  fontSize: "14px",
  // color: vars.color.labelTertiary,
});

// Close button
globalStyle(".wallet-adapter-modal-button-close", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: "18px",
  right: "18px",
  padding: "12px",
  cursor: "pointer",
  // backgroundColor: vars.color.backgroundSecondary,
  // border: `1px solid ${vars.color.backgroundTertiary}`,
  borderRadius: "50%"
});

globalStyle(".wallet-adapter-modal-button-close:hover", {
  // border: `1px solid ${vars.color.backgroundQuaternary}`,
});

globalStyle(".wallet-adapter-modal-button-close svg", {
  fill: tertiaryGreenColor,
  transition: "fill 200ms ease 0s",
});

globalStyle(".wallet-adapter-modal-button-close:hover svg", {
  // fill: vars.color.labelPrimary,
});

globalStyle(".wallet-adapter-modal-list-more", {
  cursor: "pointer",
  border: "none",
  padding: "12px 24px 24px 12px",
  alignSelf: "flex-end",
  display: "flex",
  alignItems: "center",
  // color: vars.color.labelPrimary,
  background: "transparent",
});

globalStyle(".wallet-adapter-modal-list-more svg", {
  transition: "all 0.1s ease",
  // fill: vars.color.labelPrimary,
  marginLeft: "0.5rem",
});

globalStyle(".wallet-adapter-modal-list-more-icon-rotate", {
  transform: "rotate(180deg)"
});

globalStyle(".wallet-adapter-dropdown-list", {
  position: "absolute",
  zIndex: 99,
  display: "grid",
  gridTemplateRows: "1fr",
  gridRowGap: "10px",
  padding: "10px",
  top: "100%",
  right: 0,
  margin: 0,
  listStyle: "none",
  backgroundColor: "black",
  borderRadius: "10px",
  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.6)",
  // border: `1px solid ${vars.color.backgroundTertiary}`,
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 200ms ease, transform 200ms ease, visibility 200ms",
  // fontFamily: vars.font.family
});

globalStyle(".wallet-adapter-dropdown-list-item", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  border: "none",
  outline: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  padding: "0 20px",
  width: "100%",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "bold",
  height: "37px",
  color: "#fff",
});

globalStyle(".wallet-adapter-dropdown-list-item:not([disabled]):hover", {
  // backgroundColor: vars.color.backgroundPrimary
});

// Untriaged
globalStyle(".wallet-adapter-button:not([disabled]):focus-visible", {
  outlineColor: "white"
});

// globalStyle(".wallet-adapter-button:not([disabled]):hover", {
//   "backgroundColor": "#1a1f2e"
// });

globalStyle(".wallet-adapter-button[disabled]", {
  background: "#404144",
  color: "#999",
  cursor: "not-allowed",
});

globalStyle(".wallet-adapter-button-end-icon, .wallet-adapter-button-start-icon, .wallet-adapter-button-end-icon img, .wallet-adapter-button-start-icon img", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
});

globalStyle(".wallet-adapter-button-end-icon", {
  marginLeft: "12px"
});

globalStyle(".wallet-adapter-button-start-icon", {
  marginRight: "12px"
});

globalStyle(".wallet-adapter-collapse", {
  width: "100%",
  display: "grid",
  columnGap: "12px",
  rowGap: "12px",
});

globalStyle(".wallet-adapter-dropdown", {
  position: "relative",
  display: "inline-block"
});

globalStyle(".wallet-adapter-dropdown-list-active", {
  opacity: 1,
  visibility: "visible",
  transform: "translateY(10px)",
  border: `1px solid ${tertiaryGreenColor}`,
});

globalStyle(".wallet-adapter-modal-collapse-button svg", {
  alignSelf: "center",
  fill: "#999"
});

globalStyle(".wallet-adapter-modal-collapse-button.wallet-adapter-modal-collapse-button-active svg", {
  transform: "rotate(180deg)",
  transition: "transform ease-in 150ms",
});

globalStyle(".wallet-adapter-modal.wallet-adapter-modal-fade-in", {
  opacity: 1
});

globalStyle(".wallet-adapter-modal-list .wallet-adapter-button-end-icon, .wallet-adapter-modal-list .wallet-adapter-button-start-icon, .wallet-adapter-modal-list .wallet-adapter-button-end-icon img, .wallet-adapter-modal-list .wallet-adapter-button-start-icon img", {
  width: "28px",
  height: "28px",
});

// No wallet case
globalStyle(".wallet-adapter-modal-middle", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px",
  boxSizing: "border-box",
});

globalStyle(".wallet-adapter-modal-middle-button", {
  display: "block",
  cursor: "pointer",
  marginTop: "32px",
  width: "100%",
  // backgroundColor: vars.color.accentPrimary,
  padding: "16px",
  fontSize: "18px",
  border: "none",
  borderRadius: "6px",
  // color: vars.color.backgroundPrimary,
  transition: "all 0.15s ease-in",
});

globalStyle(".wallet-adapter-modal-middle-button:hover", {
  // backgroundColor: vars.color.accentSecondary,
  // color: vars.color.labelPrimary,
});