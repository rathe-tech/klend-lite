import { TableBase } from "../control_base";
import * as css from "./borrows_table.css";

export class BorrowsTable extends TableBase {
  protected override createRootElem(): HTMLTableElement {
    const root = super.createRootElem();
    root.classList.add(css.table);
    return root;
  }
}