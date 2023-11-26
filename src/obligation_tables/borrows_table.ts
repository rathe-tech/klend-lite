import { Store } from "../models";
import { ObligationKind } from "./obligation_row";
import { ObligationTable } from "./obligation_table";

export class BorrowsTable extends ObligationTable {
  public constructor(store: Store) {
    super(ObligationKind.Borrowed, store);
  }
}