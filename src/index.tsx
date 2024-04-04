import { createRoot } from "react-dom/client";
import { Application } from "./application";
import "./theme/global.css";

const root = createRoot(document.getElementById("root")!);
root.render(<Application />);