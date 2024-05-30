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
});

export const moreContainer = style({
  position: "absolute",
  left: "100%",
  top: 0,
  height: "100%",
});

export const moreExtraWrapper = style({
  display: "flex",
  justifyContent: "start",
  alignItems: "center",
  height: "100%",
})

export const moreButton = style({
  border: `1px solid ${vars.color.borderPrimary}`,
  borderLeft: "none",
  backgroundColor: vars.color.backgroundSecondary,
  cursor: "pointer",
  writingMode: "vertical-rl",
  padding: "24px 10px",
  fontWeight: "bold",
  fontSize: "14px",
  userSelect: "none",
  color: vars.color.labelSecondary,
  ":hover": {
    color: vars.color.labelPrimary,
  },
});

export const nonScroll = style({
  overflow: "hidden !important",
});