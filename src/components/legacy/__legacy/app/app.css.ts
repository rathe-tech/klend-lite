import { style } from "@vanilla-extract/css";

export const app = style({
  margin: "0 auto",
  width: "1280px",
});

export const marketSelectContainer = style({
  marginTop: "12px",
});

export const controlsContainer = style({
  // borderTop: `1px solid ${tertiaryGreenColor}`,
  // borderBottom: `1px solid ${tertiaryGreenColor}`,
  display: "flex",
  padding: "0.5em 0",
  marginTop: "12px",
});

export const obligationContainer = style({
  display: "flex",
  marginTop: "12px",
  columnGap: "12px",
});

export const reservesContainer = style({
  display: "flex",
  marginTop: "12px",
  flexDirection: "column",
});

export const updateMarketButton = style({
  marginLeft: "auto",
  fontSize: "16px",
});