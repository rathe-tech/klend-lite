import * as css from "./control_base.css";

export abstract class ControlBase<THtmlRoot extends HTMLElement> {
  #rootElem: THtmlRoot;

  protected get rootElem() {
    return this.#rootElem;
  }

  public get isVisible() {
    return !this.#rootElem.classList.contains(css.hidden);
  }

  public set visible(value: boolean) {
    if (value) {
      this.rootElem.classList.remove(css.hidden);
    } else {
      this.rootElem.classList.add(css.hidden);
    }
  }

  public get isEnabled() {
    return !this.#rootElem.classList.contains(css.disabled);
  }

  public set enable(value: boolean) {
    if (value) {
      this.rootElem.classList.remove(css.disabled);
    } else {
      this.rootElem.classList.add(css.disabled);
    }
  }

  public constructor() {
    this.#rootElem = this.createRootElem();
  }

  protected abstract createRootElem(): THtmlRoot;

  public mount(parent: HTMLElement) {
    parent.appendChild(this.#rootElem);
  }

  public unmount() {
    this.#rootElem.remove();
  }
}