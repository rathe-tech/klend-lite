import * as React from "react";
import { Store } from "./legacy/models";
import { App } from "./legacy/app";

export const Application = () => {
  const containerRef = React.useRef(null);
  const legacyAppRef = React.useRef<App | null>(null);

  React.useEffect(() => {
    if (legacyAppRef.current == null) {
      const store = new Store();
      const app = new App(store);

      app.mount(containerRef.current!);
      store.refresh();

      legacyAppRef.current = app;
    }
  }, []);

  return (
    <React.StrictMode>
      <div ref={containerRef}></div>
    </React.StrictMode>
  );
};