import { ControlBase } from "../controls";
import * as css from "./tabs.css";

export class Tabs extends ControlBase<HTMLDivElement> {
  #items: TabItem[];
  #onSelect: ((index: number) => void) | null = null;

  public constructor(tabNames: string[]) {
    super();
    this.#items = tabNames.map(name => new TabItem(name));
    this.#items.forEach((item, index) => item.on("click", () => this.select(index)));
    this.#items.forEach(item => item.mount(this.rootElem));
  }

  public onSelect(action: (index: number) => void) {
    this.#onSelect = action;
  }

  public select(tabIndex: number, silent: boolean = false) {
    this.#items.forEach((item, index) => item.active = tabIndex === index);
    if (!silent) {
      this.#onSelect?.(tabIndex);
    }
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.tabs);
    return rootElem;
  }
}

class TabItem extends ControlBase<HTMLDivElement> {
  #active: boolean = false;

  public set active(value: boolean) {
    if (value !== this.#active) {
      this.#active = value;
      this.#active ?
        this.rootElem.classList.add(css.active) :
        this.rootElem.classList.remove(css.active);
    }
  }

  public get active() {
    return this.#active;
  }

  public constructor(name: string) {
    super();
    this.rootElem.textContent = name;
  }

  public on(tag: "click", action: () => void) {
    this.rootElem.addEventListener(tag, () => {
      if (!this.#active) {
        action();
      }
    });
  };

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.item);
    return rootElem;
  }
}