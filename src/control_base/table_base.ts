import { ControlBase } from "./control_base";
import * as css from "./table_base.css";

export class TableBase extends ControlBase<HTMLTableElement> {
  public static rootElemStyle = css.table;

  protected createRootElem(): HTMLTableElement {
    const rootElem = document.createElement("table");
    rootElem.classList.add(css.table);
    return rootElem;
  }
}

export class TableRowBase extends ControlBase<HTMLTableRowElement> {
  #key: string;

  public get key() { return this.#key; }

  public constructor(key: string) {
    super();
    this.#key = key;
  }

  protected createRootElem(): HTMLTableRowElement {
    return document.createElement("tr");
  }
}