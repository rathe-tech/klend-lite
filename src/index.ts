import { Store } from "./store";
import { App } from "./app";
import "./theme/global.css";

window.onload = async () => {
  const store = new Store();
  const app = new App(store);

  app.mount(document.body);
  await store.refresh();
};