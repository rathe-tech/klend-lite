import { globalStyle } from "@vanilla-extract/css";
import { TableBase } from "../control_base";

const table = TableBase.rootElemStyle;

globalStyle(`${table} th, td`, {
  padding: "0.25em 0.75em",
  textAlign: "right",
});

globalStyle(`${table} th:first-child, td:first-child`, {
  textAlign: "left",
});