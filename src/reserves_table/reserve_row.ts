import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";

import { ControlBase, TableRow } from "../controls";
import { Assert, UIUtils } from "../utils";
import { ActionEventTag, Store } from "../models";

import * as css from "./reserve_table.css";

export class ReserveRow extends TableRow {
  #store: Store;

  #symbolCell: HTMLTableCellElement;
  #ltvCell: HTMLTableCellElement;
  #supplyCell: HTMLTableCellElement;
  #maxSupplyCell: HTMLTableCellElement;
  #supplyApyCell: HTMLTableCellElement;
  #borrowCell: HTMLTableCellElement;
  #borrowApyCell: HTMLTableCellElement;
  #controlsCell: HTMLTableCellElement;

  #controlsWrapper: HTMLDivElement;
  #supplyButton: HTMLButtonElement;
  #borrowButton: HTMLButtonElement;

  public set actionsEnable(value: boolean) {
    if (value) {
      this.#supplyButton.removeAttribute("disabled");
      this.#borrowButton.removeAttribute("disabled");
    } else {
      this.#supplyButton.setAttribute("disabled", "true");
      this.#borrowButton.setAttribute("disabled", "true");
    }
  }

  public constructor(reserve: KaminoReserve, store: Store) {
    super(reserve.address.toBase58());
    this.#store = store;

    this.#symbolCell = document.createElement("td");
    this.#ltvCell = document.createElement("td");
    this.#supplyCell = document.createElement("td");
    this.#maxSupplyCell = document.createElement("td");
    this.#supplyApyCell = document.createElement("td");
    this.#borrowCell = document.createElement("td");
    this.#borrowApyCell = document.createElement("td");
    this.#controlsCell = document.createElement("td");

    this.#supplyButton = document.createElement("button");
    this.#borrowButton = document.createElement("button");

    this.#supplyButton.textContent = "Supply";
    this.#borrowButton.textContent = "Borrow";

    const mintAddress = new PublicKey(reserve.stats.mintAddress)
    this.#supplyButton.addEventListener("click", () => {
      this.#store.emit(ActionEventTag.Supply, { mintAddress, store });
    });
    this.#borrowButton.addEventListener("click", () => {
      this.#store.emit(ActionEventTag.Borrow, { mintAddress, store });
    });

    this.#controlsWrapper = document.createElement("div");
    this.#controlsWrapper.classList.add(css.controlsWrapper);
    this.#controlsWrapper.appendChild(this.#supplyButton);
    this.#controlsWrapper.appendChild(this.#borrowButton);
    this.#controlsCell.appendChild(this.#controlsWrapper);

    this.rootElem.appendChild(this.#symbolCell);
    this.rootElem.appendChild(this.#ltvCell);
    this.rootElem.appendChild(this.#supplyCell);
    this.rootElem.appendChild(this.#maxSupplyCell);
    this.rootElem.appendChild(this.#supplyApyCell);
    this.rootElem.appendChild(this.#borrowCell);
    this.rootElem.appendChild(this.#borrowApyCell);
    this.rootElem.appendChild(this.#controlsCell);

    this.refresh(reserve);
  }

  refresh(reserve: KaminoReserve) {
    const {
      address,
      stats: {
        symbol,
        decimals,
        loanToValuePct,
        totalSupply,
        totalBorrows,
        reserveDepositLimit,
        supplyInterestAPY,
        borrowInterestAPY,
        reserveBorrowLimit
      }
    } = reserve;

    const newKey = address.toBase58();
    Assert.ok(newKey == this.key, `Key mismatch: ${newKey} and ${this.key}`);

    this.#symbolCell.textContent = symbol;
    this.#ltvCell.textContent = UIUtils.toPercent(loanToValuePct, 0);
    this.#supplyCell.textContent = UIUtils.toUINumber(totalSupply, decimals);
    this.#maxSupplyCell.textContent = UIUtils.toUINumber(reserveDepositLimit, decimals);
    this.#supplyApyCell.textContent = UIUtils.toPercent(supplyInterestAPY, 4);
    this.#borrowCell.textContent = UIUtils.toUINumber(totalBorrows, decimals);
    this.#borrowApyCell.textContent = UIUtils.toPercent(borrowInterestAPY, 4);

    this.actionsEnable = this.#store.hasCustomer;
    this.#borrowButton.style.visibility = reserveBorrowLimit.isZero() ? "hidden" : "";
  }
}