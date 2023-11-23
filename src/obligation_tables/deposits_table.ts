import { ObligationTable, ObligationTableKind } from "./obligation_table";

export class DepositsTable extends ObligationTable {
  public constructor() {
    super(ObligationTableKind.Borrows);
  }
}