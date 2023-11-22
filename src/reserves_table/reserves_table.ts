import { KaminoMarket, KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";
import { MapUtils } from "../utils";
import { ReserveRow } from "./reserve_row";
import * as css from "./reserve_table.css";

export class ReservesTable {
  #tableElem: HTMLTableElement;
  #headElem: HTMLTableSectionElement;
  #bodyElem: HTMLTableSectionElement;

  #reserveKeys: Map<string, number>;
  #reserveRows: ReserveRow[];

  public set enable(value: boolean) {
    if (value) {
      this.#tableElem.classList.remove(css.disabled);
    } else {
      this.#tableElem.classList.add(css.disabled);
    }
  }

  public constructor() {
    this.#tableElem = document.createElement("table");
    this.#tableElem.classList.add(css.table);

    this.#headElem = document.createElement("thead");
    this.#bodyElem = document.createElement("tbody");

    const symbolHeader = document.createElement("th");
    const ltvHeader = document.createElement("th");
    const supplyHeader = document.createElement("th");
    const maxSupplyHeader = document.createElement("th");
    const supplyApyHeader = document.createElement("th");
    const borrowHeader = document.createElement("th");
    // const maxBorrowHeader = document.createElement("th");
    const borrowApyHeader = document.createElement("th");
    const controlsHeader = document.createElement("th");

    symbolHeader.textContent = "Symbol";
    ltvHeader.textContent = "LTV";
    supplyHeader.textContent = "Current Supply";
    maxSupplyHeader.textContent = "Max Supply";
    supplyApyHeader.textContent = "Supply APY";
    borrowHeader.textContent = "Current Borrow";
    // maxBorrowHeader.textContent = "Max Borrow";
    borrowApyHeader.textContent = "Borrow APY";

    this.#headElem.appendChild(symbolHeader);
    this.#headElem.appendChild(ltvHeader);
    this.#headElem.appendChild(supplyHeader);
    this.#headElem.appendChild(maxSupplyHeader);
    this.#headElem.appendChild(supplyApyHeader);
    this.#headElem.appendChild(borrowHeader);
    // this.#headElem.appendChild(maxBorrowHeader);
    this.#headElem.appendChild(borrowApyHeader);
    this.#headElem.appendChild(controlsHeader);

    this.#tableElem.appendChild(this.#headElem);
    this.#tableElem.appendChild(this.#bodyElem);

    this.#reserveKeys = new Map();
    this.#reserveRows = [];
  }

  public mount(parent: HTMLElement) {
    parent.appendChild(this.#tableElem);
  }

  public refresh({ reservesActive: reserves }: KaminoMarket) {
    const newRows = reserves.map((r, i) => this.#renderRow(r));
    const newKeys = new Map(newRows.map((r, i) => [r.key, i]));
    const unusedKeys = MapUtils.findUnusedKeys(newKeys, this.#reserveKeys);

    this.#removeUnusedRows(unusedKeys);
    this.#reserveKeys = newKeys;
    this.#reserveRows = newRows;
  }

  public purge() {
    this.#reserveRows.forEach(r => r.unmount());
    this.#reserveKeys = new Map();
    this.#reserveRows = [];
  }

  #renderRow(reserve: KaminoReserve) {
    const key = reserve.address.toBase58();
    const index = this.#reserveKeys.get(key);

    if (index != null) {
      const row = this.#reserveRows[index];
      row.refresh(reserve);
      return row;
    } else {
      const row = new ReserveRow(reserve);
      row.mount(this.#bodyElem);
      return row;
    }
  }

  #removeUnusedRows(keys: string[]) {
    keys.forEach(key => {
      const index = this.#reserveKeys.get(key);
      if (index == null) {
        throw new Error(`Could not remove elem with key ${key}`);
      }
      this.#reserveRows[index].unmount();
    });
  }
}