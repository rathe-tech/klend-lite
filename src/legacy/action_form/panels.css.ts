import { style } from "@vanilla-extract/css";
import { secondaryGreenColor, white } from "../../theme/constants";

export const panel = style({
  display: "flex",
  flexDirection: "column",
  padding: "2em",
  rowGap: "1em",
  justifyContent: "end",
});

export const submit = style({
  fontSize: "16px",
  padding: "0.5em 0.75em",
});

export const label = style({
  textAlign: "right",
  fontSize: "14px",
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