import { KaminoMarket, KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";
import { MapUtils } from "../utils";
import { Context } from "../events";
import { TableBase } from "../control_base";
import { ReserveRow } from "./reserve_row";

export class ReservesTable extends TableBase {
  #headElem: HTMLTableSectionElement;
  #bodyElem: HTMLTableSectionElement;

  #reserveKeys: Map<string, number>;
  #reserveRows: ReserveRow[];

  public constructor() {
    super();

    this.#headElem = document.createElement("thead");
    this.#bodyElem = document.createElement("tbody");

    const symbolHeader = document.createElement("th");
    const ltvHeader = document.createElement("th");
    const supplyHeader = document.createElement("th");
    const maxSupplyHeader = document.createElement("th");
    const supplyApyHeader = document.createElement("th");
    const borrowHeader = document.createElement("th");
    const borrowApyHeader = document.createElement("th");
    const controlsHeader = document.createElement("th");

    symbolHeader.textContent = "Symbol";
    ltvHeader.textContent = "LTV";
    supplyHeader.textContent = "Current Supply";
    maxSupplyHeader.textContent = "Max Supply";
    supplyApyHeader.textContent = "Supply APY";
    borrowHeader.textContent = "Current Borrow";
    borrowApyHeader.textContent = "Borrow APY";

    this.#headElem.appendChild(symbolHeader);
    this.#headElem.appendChild(ltvHeader);
    this.#headElem.appendChild(supplyHeader);
    this.#headElem.appendChild(maxSupplyHeader);
    this.#headElem.appendChild(supplyApyHeader);
    this.#headElem.appendChild(borrowHeader);
    this.#headElem.appendChild(borrowApyHeader);
    this.#headElem.appendChild(controlsHeader);

    this.rootElem.appendChild(this.#headElem);
    this.rootElem.appendChild(this.#bodyElem);

    this.#reserveKeys = new Map();
    this.#reserveRows = [];
  }

  public refresh({ reservesActive: reserves }: KaminoMarket, context: Context) {
    const newRows = reserves.map(r => this.#renderRow(r, context));
    const newKeys = new Map(newRows.map((r, i) => [r.key, i]));
    const unusedKeys = MapUtils.findUnusedKeys(newKeys, this.#reserveKeys);

    this.#removeUnusedRows(unusedKeys);
    this.#reserveKeys = newKeys;
    this.#reserveRows = newRows;
    this.enable = true;
  }

  public purge() {
    this.#reserveRows.forEach(r => r.unmount());
    this.#reserveKeys = new Map();
    this.#reserveRows = [];
  }

  #renderRow(reserve: KaminoReserve, context: Context) {
    const key = reserve.address.toBase58();
    const index = this.#reserveKeys.get(key);

    if (index != null) {
      const row = this.#reserveRows[index];
      row.refresh(reserve, context);
      return row;
    } else {
      const row = new ReserveRow(reserve, context);
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