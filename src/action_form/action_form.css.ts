import { style } from "@vanilla-extract/css";
import { primaryDarkColor, secondaryGreenColor, tertiaryGreenColor, white } from "../theme/constants";

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
  marginTop: "120px",
  width: "720px",
  border: `1px solid ${tertiaryGreenColor}`,
  backgroundColor: "black",
  display: "flex",
  flexDirection: "column",
});

export const formHeader = style({
  borderBottom: `1px solid ${tertiaryGreenColor}`,
  padding: "16px",
});

export const formBody = style({
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  rowGap: "16px",
});

export const formFooter = style({
  padding: "16px",
});

export const title = style({
  fontSize: "18px",
});

export const input = style({
  fontSize: "16px",
  padding: "0.5em 0.75em",
  outline: "none",
  textAlign: "right",
  backgroundColor: "#222",
  border: `1px solid ${secondaryGreenColor}`,
  color: white,
  borderRadius: "4px",
  ":hover": {
    backgroundColor: "#333",
  },
  ":active": {
    backgroundColor: "#333",
  },
});

export const submit = style({
  fontSize: "16px",
  padding: "0.5em 0.75em",
});