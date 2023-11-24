import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoObligation, Position } from "@hubbleprotocol/kamino-lending-sdk";

import { UIUtils } from "../utils";
import { TableBase } from "../control_base";
import { ActionEventTag, Store } from "../store";

export enum ObligationTableKind {
  Borrows,
  Deposits,
}

export abstract class ObligationTable extends TableBase {
  #kind: ObligationTableKind;
  #store: Store;

  #mainHeadElem: HTMLTableSectionElement;
  #secondaryHeadElem: HTMLTableSectionElement;
  #bodyElem: HTMLTableSectionElement;

  public constructor(kind: ObligationTableKind, store: Store) {
    super();

    this.#kind = kind;
    this.#store = store;

    this.#mainHeadElem = document.createElement("thead");
    this.#secondaryHeadElem = document.createElement("thead");
    this.#bodyElem = document.createElement("tbody");

    const titleHeader = document.createElement("th");
    titleHeader.colSpan = 4;
    titleHeader.textContent = pickTitle(this.#kind);
    this.#mainHeadElem.appendChild(titleHeader);

    const symbolHeader = document.createElement("th");
    const amountHeader = document.createElement("th");
    const controlsHeader = document.createElement("th");

    symbolHeader.textContent = "Symbol";
    amountHeader.textContent = "Amount";

    this.#secondaryHeadElem.appendChild(symbolHeader);
    this.#secondaryHeadElem.appendChild(amountHeader);
    this.#secondaryHeadElem.appendChild(controlsHeader);

    this.rootElem.appendChild(this.#mainHeadElem);
    this.rootElem.appendChild(this.#secondaryHeadElem);
    this.rootElem.appendChild(this.#bodyElem);
  }

  public refresh(market: KaminoMarket | null, obligation: KaminoObligation | null) {
    if (market == null || obligation == null) {
      this.#bodyElem.textContent = "";
      this.enable = false;
      return;
    } else {
      this.enable = true;
    }

    switch (this.#kind) {
      case ObligationTableKind.Deposits:
        this.#renderDeposits(obligation, market);
        break;
      case ObligationTableKind.Borrows:
        this.#renderBorrows(obligation, market);
        break;
      default:
        throw new Error(`Unsupported table kind: ${this.#kind}`);
    }
  }

  #renderDeposits({ deposits }: KaminoObligation, market: KaminoMarket) {
    const mints = new Map(market.reserves.map(x => [x.stats.mintAddress, x.stats]));

    const renderRow = (position: Position) => {
      const row = document.createElement("tr");

      const symbol = document.createElement("td");
      const amount = document.createElement("td");
      const controls = document.createElement("td");

      const mint = mints.get(position.mintAddress)!;

      symbol.textContent = mint.symbol;
      amount.textContent = UIUtils.toUINumber(position.amount, mint.decimals);

      const withdraw = document.createElement("button");
      withdraw.textContent = "Withdraw";
      withdraw.addEventListener("click", () => {
        this.#store.emit(ActionEventTag.Withdraw, {
          mintAddress: new PublicKey(position.mintAddress),
          store: this.#store
        });
      });
      controls.appendChild(withdraw);

      row.appendChild(symbol);
      row.appendChild(amount);
      row.appendChild(controls);

      return row;
    };

    this.#bodyElem.textContent = "";
    deposits.map(x => renderRow(x)).forEach(x => this.#bodyElem.appendChild(x));
  }

  #renderBorrows({ borrows }: KaminoObligation, market: KaminoMarket) {
    const mints = new Map(market.reserves.map(x => [x.stats.mintAddress, x.stats]));

    const renderRow = (position: Position) => {
      const row = document.createElement("tr");

      const symbol = document.createElement("td");
      const amount = document.createElement("td");
      const controls = document.createElement("td");

      const mint = mints.get(position.mintAddress)!;

      symbol.textContent = mint.symbol;
      amount.textContent = UIUtils.toUINumber(position.amount, mint.decimals);

      const repay = document.createElement("button");
      repay.textContent = "Repay";
      repay.addEventListener("click", () => {
        this.#store.emit(ActionEventTag.Repay, {
          mintAddress: new PublicKey(position.mintAddress),
          store: this.#store
        });
      });
      controls.appendChild(repay);

      row.appendChild(symbol);
      row.appendChild(amount);
      row.appendChild(controls);

      return row;
    };

    this.#bodyElem.textContent = "";
    borrows.map(x => renderRow(x)).forEach(x => this.#bodyElem.appendChild(x));
  }
}

function pickTitle(kind: ObligationTableKind) {
  switch (kind) {
    case ObligationTableKind.Borrows:
      return "Borrows";
    case ObligationTableKind.Deposits:
      return "Deposits";
    default:
      throw new Error(`Unsupported table kind: ${kind}`);
  }
}