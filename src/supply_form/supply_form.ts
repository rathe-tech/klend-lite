import { PublicKey } from "@solana/web3.js";
import { ControlBase } from "../control_base";
import { ActionEventTag, TransactionEventTag, listen } from "../events";
import { Store } from "../store";
import { UIUtils } from "../utils";
import * as css from "./supply_form.css";

export class SupplyForm extends ControlBase<HTMLDivElement> {
  #store: Store;

  #formElem: HTMLElement;
  #symbolElem: HTMLElement;
  #valueInput: HTMLInputElement;
  #submitElem: HTMLButtonElement;

  #onEscPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.close();
    }
  };
  #submit = async () => { };

  public constructor(store: Store) {
    super();
    this.#store = store;
    this.visible = false;

    this.#formElem = document.createElement("div");
    this.#symbolElem = document.createElement("div");
    this.#valueInput = document.createElement("input");
    this.#submitElem = document.createElement("button");

    this.#formElem.classList.add(css.form);
    this.#formElem.addEventListener("click", e => {
      e.stopPropagation();
    });

    this.#valueInput.type = "text";
    this.#valueInput.value = "0";

    this.#submitElem.textContent = "Supply";
    this.#submitElem.addEventListener("click", async () => {
      await this.#submit();
    });

    listen(TransactionEventTag.Processing, () => {
      this.#submitElem.setAttribute("disabled", "true");
    });
    listen(TransactionEventTag.Complete, () => {
      this.#submitElem.removeAttribute("disabled");
    });
    listen(TransactionEventTag.Error, () => {
      this.#submitElem.removeAttribute("disabled");
    });

    this.#formElem.appendChild(this.#symbolElem);
    this.#formElem.appendChild(this.#valueInput);
    this.#formElem.appendChild(this.#submitElem);
    this.rootElem.appendChild(this.#formElem);
  }

  protected override createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.overlay);
    rootElem.addEventListener("click", () => {
      this.close();
    });
    return rootElem;
  }

  public show(mintAddress: PublicKey) {
    this.visible = true;

    document.body.classList.add(css.nonScroll);
    document.body.addEventListener("keyup", this.#onEscPress);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const { symbol, decimals } = this.#store.getMint(mintAddress);

    this.#symbolElem.textContent = symbol;
    this.#submit = async () => {
      const amount = UIUtils.toNativeNumber(this.#valueInput.value, decimals);
      await this.#store.process(ActionEventTag.Supply, mintAddress, amount);
    };
  }

  public close() {
    this.visible = false;
    document.body.classList.remove(css.nonScroll);
    document.body.removeEventListener("keyup", this.#onEscPress);
  }
}