import { ObligationTable, ObligationTableKind } from "./obligation_table";

export class BorrowsTable extends ObligationTable {
  public constructor() {
    super(ObligationTableKind.Borrows);
  }
}