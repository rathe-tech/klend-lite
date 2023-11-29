import { ControlBase } from "../controls";
import { CustomerEventTag, Store, WalletEventTag } from "../models";
import { UIUtils } from "../utils";
import * as css from "./stats.css";

export class Stats extends ControlBase<HTMLDivElement> {
  #store: Store;

  #ltvStat: StatItem;
  #maxLtvStat: StatItem;
  #liquidationLtvStat: StatItem;

  public constructor(store: Store) {
    super()
    this.#store = store;

    this.#ltvStat = new StatItem({ title: "LTV:" });
    this.#maxLtvStat = new StatItem({ title: "Max LTV: " });
    this.#liquidationLtvStat = new StatItem({ title: "Liquidation LTV:" });

    this.#ltvStat.mount(this.rootElem);
    this.#maxLtvStat.mount(this.rootElem);
    this.#liquidationLtvStat.mount(this.rootElem);

    this.enable = false;

    this.#store.listen(WalletEventTag.Disconnect, () => {
      this.#ltvStat.value = "-";
      this.#maxLtvStat.value = "-";
      this.#liquidationLtvStat.value = "-";

      this.enable = false;
    });

    this.#store.listen(CustomerEventTag.Loading, () => {
      this.enable = false;
    });
    this.#store.listen(CustomerEventTag.Loaded, ({ detail: { customer } }) => {
      const ltv = customer.getLtv();
      const maxLtv = customer.getMaxLtv();
      const liquidationLtv = customer.getLiquidationLtv();

      this.#ltvStat.value = ltv ? UIUtils.toPercent(ltv.toNumber(), 4) : "-";
      this.#maxLtvStat.value = maxLtv ? UIUtils.toPercent(maxLtv.toNumber(), 4) : "-";
      this.#liquidationLtvStat.value = liquidationLtv ? UIUtils.toPercent(liquidationLtv.toNumber(), 4) : "-";

      this.enable = true;
    });
    this.#store.listen(CustomerEventTag.Error, () => {
      this.enable = false;
    });
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.stats);
    return rootElem;
  }
}

class StatItem extends ControlBase<HTMLDivElement> {
  #titleElem: HTMLDivElement;
  #valueElem: HTMLDivElement;

  public set title(value: string) {
    this.#titleElem.textContent = value;
  }

  public set value(value: string) {
    this.#valueElem.textContent = value;
  }

  public constructor({ title = "", value = "-" } = {}) {
    super();

    this.#titleElem = document.createElement("div");
    this.#valueElem = document.createElement("div");

    this.#titleElem.classList.add(css.title);
    this.#valueElem.classList.add(css.value);

    this.title = title;
    this.value = value;

    this.rootElem.appendChild(this.#titleElem);
    this.rootElem.appendChild(this.#valueElem);
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.statItem);
    return rootElem;
  }
}