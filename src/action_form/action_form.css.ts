import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(3px)",
  overflowY: "auto",
});

export const hidden = style({
  display: "none",
});

export const nonScroll = style({
  overflow: "hidden",
});

export const form = style({
  margin: "0 auto",
  width: "720px",
  height: "560px",
  border: "1px solid green",
  backgroundColor: "black",
});