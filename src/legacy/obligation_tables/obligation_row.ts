import { PublicKey } from "@solana/web3.js";
import { Position } from "@hubbleprotocol/kamino-lending-sdk";

import { Assert, UIUtils } from "../../utils";
import { TableRow } from "../controls";
import { ActionEventTag, Store } from "../models";

import * as css from "./obligation_tables.css";

export enum ObligationKind {
  Borrowed,
  Supplied,
}

export class ObligationRow extends TableRow {
  #kind: ObligationKind;
  #store: Store;

  #symbolCell: HTMLTableCellElement;
  #amountCell: HTMLTableCellElement;
  #controlsCell: HTMLTableCellElement;

  #controlsWrapper: HTMLDivElement;
  #actionButtons: [HTMLButtonElement, HTMLButtonElement];

  public set actionsEnable(value: boolean) {
    if (value) {
      this.#actionButtons.forEach(b => b.removeAttribute("disabled"));
    } else {
      this.#actionButtons.forEach(b => b.setAttribute("disabled", "true"));
    }
  }

  public constructor(position: Position, kind: ObligationKind, store: Store) {
    super(position.mintAddress.toBase58());
    this.#kind = kind;
    this.#store = store;

    this.#symbolCell = document.createElement("td");
    this.#amountCell = document.createElement("td");
    this.#controlsCell = document.createElement("td");

    this.#controlsWrapper = document.createElement("div");
    this.#controlsWrapper.classList.add(css.controlsWrapper);
    this.#actionButtons = this.#createActionButtons();
    this.#controlsWrapper.appendChild(this.#actionButtons[0]);
    this.#controlsWrapper.appendChild(this.#actionButtons[1]);
    this.#controlsCell.appendChild(this.#controlsWrapper);

    this.rootElem.appendChild(this.#symbolCell);
    this.rootElem.appendChild(this.#amountCell);
    this.rootElem.appendChild(this.#controlsCell);

    this.refresh(position);
  }

  #createActionButtons() {
    const mainButton = document.createElement("button");
    const secondaryButton = document.createElement("button");
    const details = {
      mintAddress: new PublicKey(this.key),
      store: this.#store
    };

    switch (this.#kind) {
      case ObligationKind.Borrowed:
        mainButton.textContent = "Borrow";
        secondaryButton.textContent = "Repay";
        mainButton.addEventListener("click", () => this.#store.emit(ActionEventTag.Borrow, details));
        secondaryButton.addEventListener("click", () => this.#store.emit(ActionEventTag.Repay, details));
        break;
      case ObligationKind.Supplied:
        mainButton.textContent = "Supply";
        secondaryButton.textContent = "Withdraw";
        mainButton.addEventListener("click", () => this.#store.emit(ActionEventTag.Supply, details));
        secondaryButton.addEventListener("click", () => this.#store.emit(ActionEventTag.Withdraw, details));
        break;
      default:
        throw new Error(`Unsupported kind: ${this.#kind}`);
    }
    return [mainButton, secondaryButton] as [HTMLButtonElement, HTMLButtonElement];
  }

  public refresh(position: Position) {
    const { amount, mintAddress } = position;
    const { symbol, decimals} = this.#store.marketChecked.getMintChecked(new PublicKey(mintAddress));
    Assert.ok(mintAddress.toBase58() == this.key, `Key mismatch: ${mintAddress} and ${this.key}`);

    this.#symbolCell.textContent = symbol;
    this.#amountCell.textContent = UIUtils.toUINumber(amount, decimals);
    this.actionsEnable = this.#store.hasCustomer;
  }
}