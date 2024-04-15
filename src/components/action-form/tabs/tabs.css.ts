import { style } from "@vanilla-extract/css";
import { vars } from "../../../theme/vars.css";

export const tabs = style({
  display: "flex",
});

export const item = style({
  fontSize: "14px",
  cursor: "pointer",
  flex: 1,
  display: "flex",
  fontWeight: 700,
  justifyContent: "center",
  alignItems: "center",
  padding: "1em 0",
  color: vars.color.labelSecondary,
  backgroundColor: vars.color.backgroundSecondary,
  borderBottom: `1px solid ${vars.color.borderPrimary}`,
});

export const activeItem = style([item, {
  color: vars.color.labelPrimary,
  backgroundColor: vars.color.backgroundPrimary,
  borderBottom: `1px solid ${vars.color.backgroundPrimary}`,
  borderLeft: `1px solid ${vars.color.borderPrimary}`,
  borderRight: `1px solid ${vars.color.borderPrimary}`,
  ":first-child": {
    borderLeft: "none"
  },
  ":last-child": {
    borderRight: "none"
  },
}]);