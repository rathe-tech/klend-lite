import { PublicKey } from "@solana/web3.js";
import { ControlBase } from "../control_base";
import * as css from "./supply_form.css";

export class SupplyForm extends ControlBase<HTMLDivElement> {
  #onEscPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.close();
    }
  };

  public constructor() {
    super();
    this.visible = false;
  }

  protected override createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.form);
    rootElem.addEventListener("click", () => {
      this.close();
    });
    return rootElem;
  }

  public show(reserveAddress: PublicKey) {
    this.visible = true;
    document.body.classList.add(css.nonScroll);
    document.body.addEventListener("keyup", this.#onEscPress);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  public close() {
    this.visible = false;
    document.body.classList.remove(css.nonScroll);
    document.body.removeEventListener("keyup", this.#onEscPress);
  }
}