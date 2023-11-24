import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";
import { UIUtils } from "../utils";
import { ActionEventTag, Context, emit } from "../events";

export class ReserveRow {
  #key: string;
  #rowElem: HTMLTableRowElement;

  #symbolCell: HTMLTableCellElement;
  #ltvCell: HTMLTableCellElement;
  #supplyCell: HTMLTableCellElement;
  #maxSupplyCell: HTMLTableCellElement;
  #supplyApyCell: HTMLTableCellElement;
  #borrowCell: HTMLTableCellElement;
  #borrowApyCell: HTMLTableCellElement;
  #controlsCell: HTMLTableCellElement;

  #supplyButton: HTMLButtonElement;
  #borrowButton: HTMLButtonElement;

  public get key() {
    return this.#key;
  }

  public constructor(reserve: KaminoReserve, context: Context) {
    this.#key = reserve.address.toBase58();
    this.#rowElem = document.createElement("tr") as HTMLTableRowElement;

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
        context
      });
    });
    this.#borrowButton.addEventListener("click", () => {
      emit(ActionEventTag.Borrow, {
        mintAddress: new PublicKey(reserve.stats.mintAddress),
        context
      });
    });

    this.#controlsCell.appendChild(this.#supplyButton);
    this.#controlsCell.appendChild(this.#borrowButton);

    this.#rowElem.appendChild(this.#symbolCell);
    this.#rowElem.appendChild(this.#ltvCell);
    this.#rowElem.appendChild(this.#supplyCell);
    this.#rowElem.appendChild(this.#maxSupplyCell);
    this.#rowElem.appendChild(this.#supplyApyCell);
    this.#rowElem.appendChild(this.#borrowCell);
    this.#rowElem.appendChild(this.#borrowApyCell);
    this.#rowElem.appendChild(this.#controlsCell);

    this.refresh(reserve, context);
  }

  public mount(parent: HTMLElement) {
    parent.appendChild(this.#rowElem);
  }

  public unmount() {
    this.#rowElem.remove();
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