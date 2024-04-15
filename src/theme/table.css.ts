import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./vars.css";

globalStyle("table", {
  width: "100%",
  border: `1px solid ${vars.color.borderPrimary}`,
  borderSpacing: "unset",
  borderCollapse: "collapse",
});

globalStyle("th, td", {
  padding: "10px 12px",
  textAlign: "right",
});

globalStyle("th", {
  fontSize: "16px",
  color: vars.color.labelSecondary,
  backgroundColor: vars.color.backgroundSecondary,
})

globalStyle("th:first-child, td:first-child", {
  textAlign: "left",
});

globalStyle("tbody tr", {
  borderTop: `1px solid ${vars.color.borderPrimary}`,
});

globalStyle("tbody tr:hover", {
  backgroundColor: vars.color.backgroundSecondary,
});