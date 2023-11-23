import { KaminoMarket, KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";
import { TableBase } from "../control_base";

export enum ObligationTableKind {
  Borrows,
  Deposits,
}

export abstract class ObligationTable extends TableBase {
  #kind: ObligationTableKind;

  public constructor(kind: ObligationTableKind) {
    super();
    this.#kind = kind;
  }

  public refresh(market: KaminoMarket | null, obligation: KaminoObligation | null) {
    if (market == null || obligation == null) {
      this.enable = false;
      return;
    } else {
      this.enable = true;
    }

    switch (this.#kind) {
      case ObligationTableKind.Deposits:
        this.#renderDeposits();
        break;
      case ObligationTableKind.Borrows:
        this.#renderBorrows();
        break;
      default:
        throw new Error(`Unsupported table kind: ${this.#kind}`);
    }
  }

  #renderDeposits() {
    
  }

  #renderBorrows() {

  }
}