import { Store } from "../store";
import { ObligationTable, ObligationTableKind } from "./obligation_table";

export class BorrowsTable extends ObligationTable {
  public constructor(store: Store) {
    super(ObligationTableKind.Borrows, store);
  }
}