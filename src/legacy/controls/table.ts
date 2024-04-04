import { ControlBase } from "./control_base";
import * as css from "./table.css";

export class Table extends ControlBase<HTMLTableElement> {
  protected createRootElem(): HTMLTableElement {
    const rootElem = document.createElement("table");
    rootElem.classList.add(css.table);
    return rootElem;
  }
}

export class TableRow extends ControlBase<HTMLTableRowElement> {
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