import { createRoot } from "react-dom/client";
import { Application } from "./Application";
import "@theme/global.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Application />
);