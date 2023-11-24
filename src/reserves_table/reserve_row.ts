import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";

import { Store } from "../store";
import { UIUtils } from "../utils";
import { ControlBase } from "../control_base";
import { ActionEventTag, Context, emit } from "../events";

import * as css from "./reserve_table.css";

export class ReserveRow extends ControlBase<HTMLTableRowElement> {
  #key: string;

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

  public get key() {
    return this.#key;
  }

  public constructor(reserve: KaminoReserve, store: Store) {
    super();
    this.#key = reserve.address.toBase58();

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

    this.#supplyButton.addEventListener("click", () => {
      emit(ActionEventTag.Supply, {
        mintAddress: new PublicKey(reserve.stats.mintAddress),
        context: store
      });
    });
    this.#borrowButton.addEventListener("click", () => {
      emit(ActionEventTag.Borrow, {
        mintAddress: new PublicKey(reserve.stats.mintAddress),
        context: store
      });
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

    this.refresh(reserve, store);
  }

  protected override createRootElem(): HTMLTableRowElement {
    return document.createElement("tr");
  }

  refresh(reserve: KaminoReserve, context: Context) {
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
      }
    } = reserve;

    const newKey = address.toBase58();
    if (newKey !== this.#key) {
      throw new Error(`Key mismatch: ${newKey} and ${this.#key}`);
    }

    this.#symbolCell.textContent = symbol;
    this.#ltvCell.textContent = UIUtils.toPercent(loanToValuePct);
    this.#supplyCell.textContent = UIUtils.toUINumber(totalSupply, decimals);
    this.#maxSupplyCell.textContent = UIUtils.toUINumber(reserveDepositLimit, decimals);
    this.#supplyApyCell.textContent = UIUtils.toPercent(supplyInterestAPY);
    this.#borrowCell.textContent = UIUtils.toUINumber(totalBorrows, decimals);
    this.#borrowApyCell.textContent = UIUtils.toPercent(borrowInterestAPY);

    if (context.wallet.isConnected) {
      this.#supplyButton.removeAttribute("disabled");
      this.#borrowButton.removeAttribute("disabled");
    } else {
      this.#supplyButton.setAttribute("disabled", "true");
      this.#borrowButton.setAttribute("disabled", "true");
    }
  }
}