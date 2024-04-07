import Decimal from "decimal.js";
import { UIUtils } from "../../../../utils";
import { ControlBase } from "../controls";
import { type MintInfo } from "../models";
import * as css from "./balance_info.css";

export class BalanceInfo extends ControlBase<HTMLDivElement> {
  #titleSuffix: string;

  #titleElem: HTMLDivElement;
  #valueElem: HTMLDivElement;

  public constructor(titleSuffix: string = "balance") {
    super();
    this.#titleSuffix = titleSuffix;

    this.#titleElem = document.createElement("div");
    this.#valueElem = document.createElement("div");

    this.#valueElem.classList.add(css.value);

    this.rootElem.appendChild(this.#titleElem);
    this.rootElem.appendChild(this.#valueElem);
  }

  public updateBalance(value: Decimal | null | undefined, { symbol, decimals }: MintInfo) {
    this.#titleElem.textContent = `${symbol} ${this.#titleSuffix}:`
    this.#valueElem.textContent = value == null ? "0" : UIUtils.toUINumber(value, decimals);
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.root);
    return rootElem;
  }
}