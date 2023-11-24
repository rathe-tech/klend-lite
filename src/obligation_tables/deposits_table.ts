import { Store } from "../store";
import { ObligationTable, ObligationTableKind } from "./obligation_table";

export class DepositsTable extends ObligationTable {
  public constructor(store: Store) {
    super(ObligationTableKind.Deposits, store);
  }
}