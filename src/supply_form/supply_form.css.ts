import { style } from "@vanilla-extract/css";

export const form = style({
  display: "flex",
  position: "absolute",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(3px)"
});

export const hidden = style({
  display: "none",
});

export const nonScroll = style({
  overflow: "hidden",
})