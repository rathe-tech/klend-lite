import { PublicKey } from "@solana/web3.js";
import { Position } from "@hubbleprotocol/kamino-lending-sdk";

import { Assert, UIUtils } from "../utils";
import { TableRow } from "../controls";
import { ActionEventTag, Store } from "../models";

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

  #actionButton: HTMLButtonElement;

  public set actionsEnable(value: boolean) {
    if (value) {
      this.#actionButton.removeAttribute("disabled");
    } else {
      this.#actionButton.setAttribute("disabled", "true");
    }
  }

  public constructor(position: Position, kind: ObligationKind, store: Store) {
    super(position.mintAddress);
    this.#kind = kind;
    this.#store = store;

    this.#symbolCell = document.createElement("td");
    this.#amountCell = document.createElement("td");
    this.#controlsCell = document.createElement("td");

    this.#actionButton = document.createElement("button");
    this.#actionButton.textContent = pickActionTitle(this.#kind);
    this.#actionButton.addEventListener("click", this.#createActionCallback());
    this.#controlsCell.appendChild(this.#actionButton);

    this.rootElem.appendChild(this.#symbolCell);
    this.rootElem.appendChild(this.#amountCell);
    this.rootElem.appendChild(this.#controlsCell);

    this.refresh(position);
  }

  #createActionCallback() {
    const details = {
      mintAddress: new PublicKey(this.key),
      store: this.#store
    };

    switch (this.#kind) {
      case ObligationKind.Borrowed:
        return () => this.#store.emit(ActionEventTag.Repay, details);
      case ObligationKind.Supplied:
        return () => this.#store.emit(ActionEventTag.Withdraw, details);
      default:
        throw new Error(`Unsupported kind: ${this.#kind}`);
    }
  }

  public refresh(position: Position) {
    const { amount, mintAddress } = position;
    const { symbol, decimals} = this.#store.marketChecked.getMintChecked(new PublicKey(mintAddress));
    Assert.ok(mintAddress == this.key, `Key mismatch: ${mintAddress} and ${this.key}`);

    this.#symbolCell.textContent = symbol;
    this.#amountCell.textContent = UIUtils.toUINumber(amount, decimals);
    this.actionsEnable = this.#store.hasCustomer;
  }
}

function pickActionTitle(kind: ObligationKind) {
  switch (kind) {
    case ObligationKind.Borrowed:
      return "Repay";
    case ObligationKind.Supplied:
      return "Withdraw";
    default:
      throw new Error(`Unsupported kind: ${kind}`);
  }
}