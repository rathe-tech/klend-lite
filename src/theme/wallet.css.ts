import { globalStyle } from "@vanilla-extract/css";
import { mobileMediaQuery, vars } from "./vars.css";

// All buttons in wallet lib uses this class.
globalStyle(".wallet-adapter-button", {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
});

// Connect wallet button
globalStyle(".wallet-adapter-button-trigger", {
  display: "flex",
  alignItems: "center",
  height: "38px",
  fontSize: "14px",
  padding: "0 1.25em",
  "@media": {
    [mobileMediaQuery]: {
      padding: "0 0.75em",
    }
  }
});

globalStyle(".wallet-adapter-button-trigger:hover", {});

// Connected wallet button
globalStyle(".wallet-adapter-dropdown .wallet-adapter-button-trigger", {});

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
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(3px)",
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
  padding: `0 ${vars.desktop.containerOffset}`,
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
  backgroundColor: vars.color.backgroundPrimary,
  border: `1px solid ${vars.color.borderPrimary}`,
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

// Modal window title
globalStyle(".wallet-adapter-modal-title", {
  fontSize: "24px",
  fontWeight: "bold",
  padding: "48px 32px 0px 32px",
  marginTop: "24px",
  marginBottom: "12px",
  textAlign: "center",
})

globalStyle(".wallet-adapter-modal-list", {
  padding: "0 16px",
  width: "100%",
  listStyle: "none",
  display: "grid",
  columnGap: "12px",
  rowGap: "12px",
});

// An item from available wallets list
globalStyle(".wallet-adapter-modal-list .wallet-adapter-button", {
  boxSizing: "border-box",
  width: "100%",
  padding: "12px",
  fontSize: "16px",
});

globalStyle(".wallet-adapter-modal-list .wallet-adapter-button:hover", {
  transition: "border 0.25s ease-in",
});

globalStyle(".wallet-adapter-modal-list .wallet-adapter-button span", {
  marginLeft: "auto",
  fontSize: "12px",
  color: vars.color.labelSecondary,
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
  borderRadius: "50%"
});

globalStyle(".wallet-adapter-modal-button-close:hover", {

});

globalStyle(".wallet-adapter-modal-button-close svg", {
  fill: vars.color.labelPrimary,
  transition: "fill 200ms ease 0s",
});

globalStyle(".wallet-adapter-modal-button-close:hover svg", {

});

globalStyle(".wallet-adapter-modal-list-more", {
  cursor: "pointer",
  border: "none",
  padding: "12px 24px 24px 12px",
  alignSelf: "flex-end",
  display: "flex",
  alignItems: "center",
  background: "transparent",
});

globalStyle(".wallet-adapter-modal-list-more svg", {
  transition: "all 0.1s ease",
  marginLeft: "0.5rem",
});

globalStyle(".wallet-adapter-modal-list-more-icon-rotate", {
  transform: "rotate(180deg)"
});

// Dropdown menu for copy, change, disconnect wallet
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
  backgroundColor: vars.color.backgroundPrimary,
  borderRadius: "4px",
  border: `1px solid ${vars.color.borderPrimary}`,
  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.6)",
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 200ms ease, transform 200ms ease, visibility 200ms",
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
  padding: "0 16px",
  width: "100%",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "bold",
  height: "37px",
  color: vars.color.labelSecondary,
});

globalStyle(".wallet-adapter-dropdown-list-item:not([disabled]):hover", {
  backgroundColor: vars.color.buttonDefaultBackgroundHover,
  color: vars.color.labelPrimary,
});

globalStyle(".wallet-adapter-dropdown-list-item:not([disabled]):active", {
  backgroundColor: vars.color.buttonDefaultBackgroundActive,
});

globalStyle(".wallet-adapter-button:not([disabled]):focus-visible", {

});

globalStyle(".wallet-adapter-button:not([disabled]):hover", {

});

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
  padding: "16px",
  fontSize: "18px",
  border: "none",
  borderRadius: "6px",
  transition: "all 0.15s ease-in",
});

globalStyle(".wallet-adapter-modal-middle-button:hover", {
});