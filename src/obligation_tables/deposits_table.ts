import { Store } from "../models";
import { ObligationKind } from "./obligation_row";
import { ObligationTable } from "./obligation_table";

export class DepositsTable extends ObligationTable {
  public constructor(store: Store) {
    super(ObligationKind.Supplied, store);
  }
}