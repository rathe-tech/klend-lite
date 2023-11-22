import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";
import { UIUtils } from "../utils";

export class ReserveRow {
  #key: string;
  #rowElem: HTMLTableRowElement;

  #symbolCell: HTMLTableCellElement;
  #ltvCell: HTMLTableCellElement;
  #supplyCell: HTMLTableCellElement;
  #maxSupplyCell: HTMLTableCellElement;
  #supplyApyCell: HTMLTableCellElement;
  #borrowCell: HTMLTableCellElement;
  // #maxBorrowCell: HTMLTableCellElement;
  #borrowApyCell: HTMLTableCellElement;
  #controlsCell: HTMLTableCellElement;

  public get key() {
    return this.#key;
  }

  public constructor(reserve: KaminoReserve) {
    this.#key = reserve.address.toBase58();
    this.#rowElem = document.createElement("tr") as HTMLTableRowElement;

    this.#symbolCell = document.createElement("td");
    this.#ltvCell = document.createElement("td");
    this.#supplyCell = document.createElement("td");
    this.#maxSupplyCell = document.createElement("td");
    this.#supplyApyCell = document.createElement("td");
    this.#borrowCell = document.createElement("td");
    // this.#maxBorrowCell = document.createElement("td");
    this.#borrowApyCell = document.createElement("td");
    this.#controlsCell = document.createElement("td");

    const supplyButton = document.createElement("button");
    const borrowButton = document.createElement("button");
    
    supplyButton.textContent = "Supply";
    borrowButton.textContent = "Borrow";

    supplyButton.addEventListener("click", () => {
      const event = new CustomEvent("klend:supply", {
        bubbles: true,
        detail: {
          reserveAddress: reserve.address
        }
      });
      document.dispatchEvent(event);
    });
    borrowButton.addEventListener("click", () => {
      const event = new CustomEvent("klend:borrow", {
        bubbles: true,
        detail: {
          reserveAddress: reserve.address
        }
      });
      document.dispatchEvent(event);
    });

    this.#controlsCell.appendChild(supplyButton);
    this.#controlsCell.appendChild(borrowButton);

    this.#rowElem.appendChild(this.#symbolCell);
    this.#rowElem.appendChild(this.#ltvCell);
    this.#rowElem.appendChild(this.#supplyCell);
    this.#rowElem.appendChild(this.#maxSupplyCell);
    this.#rowElem.appendChild(this.#supplyApyCell);
    this.#rowElem.appendChild(this.#borrowCell);
    // this.#rowElem.appendChild(this.#maxBorrowCell);
    this.#rowElem.appendChild(this.#borrowApyCell);
    this.#rowElem.appendChild(this.#controlsCell);

    this.refresh(reserve);
  }

  public mount(parent: HTMLElement) {
    parent.appendChild(this.#rowElem);
  }

  public unmount() {
    this.#rowElem.remove();
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
        reserveBorrowLimit,
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
    this.#supplyCell.textContent = UIUtils.toUIDecimal(totalSupply, decimals);
    this.#maxSupplyCell.textContent = UIUtils.toUIDecimal(reserveDepositLimit, decimals);
    this.#supplyApyCell.textContent = UIUtils.toPercent(supplyInterestAPY);
    this.#borrowCell.textContent = UIUtils.toUIDecimal(totalBorrows, decimals);
    // this.#maxBorrowCell.textContent = UIUtils.toUIDecimal(reserveBorrowLimit, decimals);
    this.#borrowApyCell.textContent = UIUtils.toPercent(borrowInterestAPY);
  }
}