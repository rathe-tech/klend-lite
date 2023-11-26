import Decimal from "decimal.js";
import { UIUtils } from "../utils";
import { ControlBase } from "../controls";
import { type MintInfo } from "../models";
import * as css from "./wallet_balance.css";

export class WalletBalance extends ControlBase<HTMLDivElement> {
  #titleElem: HTMLDivElement;
  #valueElem: HTMLDivElement;

  public constructor() {
    super();
    this.#titleElem = document.createElement("div");
    this.#valueElem = document.createElement("div");

    this.#titleElem.textContent = "Wallet Balance:";
    this.#valueElem.textContent = "0";

    this.rootElem.appendChild(this.#titleElem);
    this.rootElem.appendChild(this.#valueElem);
  }

  public updateBalance(value: Decimal | null | undefined, { decimals }: MintInfo) {
    this.#valueElem.textContent = value == null ? "0" : UIUtils.toUINumber(value, decimals);
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.root);
    return rootElem;
  }
}