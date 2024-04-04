import { Position } from "@hubbleprotocol/kamino-lending-sdk";

import { Assert, MapUtils } from "../../utils";
import { Table } from "../controls";
import {
  Store,
  Customer,
  CustomerEventTag,
  MarketEventTag,
  WalletEventTag
} from "../models";

import { ObligationKind, ObligationRow } from "./obligation_row";
import * as css from "./obligation_tables.css";

abstract class ObligationTable extends Table {
  #kind: ObligationKind;
  #store: Store;

  #mainHeadElem: HTMLTableSectionElement;
  #secondaryHeadElem: HTMLTableSectionElement;
  #bodyElem: HTMLTableSectionElement;

  #totalAmountCell: HTMLTableCellElement;

  #obligationKeys: Map<string, number>;
  #obligationRows: ObligationRow[];

  public constructor(kind: ObligationKind, store: Store) {
    super();

    this.#kind = kind;
    this.#store = store;

    this.#store.listen(WalletEventTag.Disconnect, () => {
      this.#purge();
      this.enable = false;
    });

    this.#store.listen(MarketEventTag.Loading, () => {
      this.enable = false;
    });

    this.#store.listen(CustomerEventTag.Loading, () => {
      this.enable = false;
    });
    this.#store.listen(CustomerEventTag.Loaded, e => {
      this.refresh(e.detail.customer);
    });
    this.#store.listen(CustomerEventTag.Error, () => {
      this.enable = false;
    });

    this.#mainHeadElem = document.createElement("thead");
    this.#secondaryHeadElem = document.createElement("thead");
    this.#bodyElem = document.createElement("tbody");

    const titleHeader = document.createElement("th");
    titleHeader.colSpan = 2;
    titleHeader.textContent = pickTitle(this.#kind);
    this.#mainHeadElem.appendChild(titleHeader);

    this.#totalAmountCell = document.createElement("th");
    this.#totalAmountCell.classList.add(css.totalAmountCell);
    this.#mainHeadElem.appendChild(this.#totalAmountCell);

    const symbolHeader = document.createElement("th");
    const amountHeader = document.createElement("th");
    const controlsHeader = document.createElement("th");

    symbolHeader.textContent = "Asset";
    amountHeader.textContent = "Amount";

    this.#secondaryHeadElem.appendChild(symbolHeader);
    this.#secondaryHeadElem.appendChild(amountHeader);
    this.#secondaryHeadElem.appendChild(controlsHeader);

    this.rootElem.appendChild(this.#mainHeadElem);
    this.rootElem.appendChild(this.#secondaryHeadElem);
    this.rootElem.appendChild(this.#bodyElem);

    this.#obligationKeys = new Map();
    this.#obligationRows = [];
  }

  public refresh(customer: Customer | null) {
    if (customer == null) {
      this.#purge();
      return;
    }

    this.#totalAmountCell.textContent = pickTotalAmount(customer, this.#kind);

    const positions = pickPositions(customer, this.#kind);
    const newRows = positions.map(p => this.#renderRow(p));
    const newKeys = new Map(newRows.map((r, i) => [r.key, i]));
    const unusedKeys = MapUtils.findUnusedKeys(newKeys, this.#obligationKeys);

    this.#removeUnusedRows(unusedKeys);
    this.#obligationKeys = newKeys;
    this.#obligationRows = newRows;
    this.enable = true;
  }

  #purge() {
    this.#totalAmountCell.textContent = "";
    this.#obligationRows.forEach(r => r.unmount());
    this.#obligationKeys = new Map();
    this.#obligationRows = [];
  }

  #renderRow(position: Position) {
    const key = position.mintAddress.toBase58();
    const index = this.#obligationKeys.get(key);

    if (index != null) {
      const row = this.#obligationRows[index];
      row.refresh(position);
      return row;
    } else {
      const row = new ObligationRow(position, this.#kind, this.#store);
      row.mount(this.#bodyElem);
      return row;
    }
  }

  #removeUnusedRows(keys: string[]) {
    keys.forEach(key => {
      const index = this.#obligationKeys.get(key);
      Assert.some(index, `Could not remove elem with key ${key}`);
      this.#obligationRows[index].unmount();
    });
  }
}

export class DepositsTable extends ObligationTable {
  public constructor(store: Store) {
    super(ObligationKind.Supplied, store);
  }
}

export class BorrowsTable extends ObligationTable {
  public constructor(store: Store) {
    super(ObligationKind.Borrowed, store);
  }
}

function pickTitle(kind: ObligationKind) {
  switch (kind) {
    case ObligationKind.Borrowed:
      return "Borrowed";
    case ObligationKind.Supplied:
      return "Supplied";
    default:
      throw new Error(`Unsupported kind: ${kind}`);
  }
}

function pickPositions(customer: Customer, kind: ObligationKind) {
  switch (kind) {
    case ObligationKind.Borrowed:
      return customer.getBorrows();
    case ObligationKind.Supplied:
      return customer.getDeposits();
    default:
      throw new Error(`Unsupported kind: ${kind}`);
  }
}

function pickTotalAmount(customer: Customer, kind: ObligationKind) {
  switch (kind) {
    case ObligationKind.Borrowed:
      return customer.getTotalBorrowedFormatted();
    case ObligationKind.Supplied:
      return customer.getTotalSuppliedFormatted();
    default: 
      throw new Error(`Unsupported kind: ${kind}`);
  }
}