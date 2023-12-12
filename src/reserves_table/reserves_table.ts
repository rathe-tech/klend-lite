import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";
import { Table } from "../controls";
import { Assert, MapUtils } from "../utils";
import { Store, Market, CustomerEventTag, MarketEventTag, WalletEventTag } from "../models";
import { ReserveRow } from "./reserve_row";

export class ReservesTable extends Table {
  #store: Store;

  #headElem: HTMLTableSectionElement;
  #bodyElem: HTMLTableSectionElement;

  #reserveKeys: Map<string, number>;
  #reserveRows: ReserveRow[];

  set #actionsEnable(value: boolean) {
    this.#reserveRows.forEach(x => x.actionsEnable = value);
  }

  public constructor(store: Store) {
    super();
    this.#store = store;

    this.#store.listen(WalletEventTag.Disconnect, () => {
      this.#actionsEnable = false;
    });

    this.#store.listen(MarketEventTag.Loading, () => {
      this.enable = false;
    });
    this.#store.listen(MarketEventTag.Loaded, e => {
      this.refresh(e.detail.market);
    });
    this.#store.listen(MarketEventTag.Error, () => {
      this.enable = false;
    });

    this.#store.listen(CustomerEventTag.Loading, () => {
      this.#actionsEnable = false;
    });
    this.#store.listen(CustomerEventTag.Loaded, () => {
      this.#actionsEnable = true;
    });
    this.#store.listen(CustomerEventTag.Error, () => {
      this.#actionsEnable = false;
    });

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

    symbolHeader.textContent = "Asset";
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

  public refresh(market: Market) {
    const newRows = market.getReserves().map(r => this.#renderRow(r));
    const newKeys = new Map(newRows.map((r, i) => [r.key, i]));
    const unusedKeys = MapUtils.findUnusedKeys(newKeys, this.#reserveKeys);

    this.#removeUnusedRows(unusedKeys);
    this.#reserveKeys = newKeys;
    this.#reserveRows = newRows;
    this.enable = true;
  }

  #renderRow(reserve: KaminoReserve) {
    const key = reserve.address.toBase58();
    const index = this.#reserveKeys.get(key);

    if (index != null) {
      const row = this.#reserveRows[index];
      row.refresh(reserve);
      return row;
    } else {
      const row = new ReserveRow(reserve, this.#store);
      row.mount(this.#bodyElem);
      return row;
    }
  }

  #removeUnusedRows(keys: string[]) {
    keys.forEach(key => {
      const index = this.#reserveKeys.get(key);
      Assert.some(index, `Could not remove elem with key ${key}`);
      this.#reserveRows[index].unmount();
    });
  }
}