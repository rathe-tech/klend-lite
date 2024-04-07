import { PublicKey } from "@solana/web3.js";

import { Assert } from "../../../../utils";
import { ControlBase } from "../controls";
import { ActionEventTag, Store, TransactionEventTag } from "../models";

import { Tabs } from "./tabs";
import { BorrowPanel, Panel, RepayPanel, SupplyPanel, WithdrawPanel } from "./panels";
import * as css from "./action_form.css";

export class ActionForm extends ControlBase<HTMLDivElement> {
  #store: Store;
  #formElem: HTMLElement;

  #tabs: Tabs;
  #panels: Panel[];

  #actionIndices: Map<ActionEventTag, number>;
  #cachedMint: PublicKey | null = null;

  #onEscPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.close();
    }
  };

  public constructor(store: Store) {
    super();
    this.#store = store;
    this.visible = false;

    this.#formElem = document.createElement("div");
    this.#formElem.classList.add(css.form);
    this.#formElem.addEventListener("click", e => {
      e.stopPropagation();
    });
    this.rootElem.appendChild(this.#formElem);

    this.#tabs = new Tabs(["Supply", "Borrow", "Repay", "Withdraw"]);
    this.#tabs.mount(this.#formElem);
    this.#tabs.onSelect(index => {
      Assert.some(this.#cachedMint, "No active mint");
      this.#showPanel(index, this.#cachedMint);
    });
    this.#panels = [
      new SupplyPanel(this.#store),
      new BorrowPanel(this.#store),
      new RepayPanel(this.#store),
      new WithdrawPanel(this.#store)
    ];
    this.#panels.forEach(p => p.mount(this.#formElem));
    this.#actionIndices = new Map([
      [ActionEventTag.Supply, 0],
      [ActionEventTag.Borrow, 1],
      [ActionEventTag.Repay, 2],
      [ActionEventTag.Withdraw, 3]
    ]);

    this.#store.listen(ActionEventTag.Supply, e => {
      this.show(ActionEventTag.Supply, e.detail.mintAddress);
    });
    this.#store.listen(ActionEventTag.Borrow, e => {
      this.show(ActionEventTag.Borrow, e.detail.mintAddress);
    });
    this.#store.listen(ActionEventTag.Withdraw, e => {
      this.show(ActionEventTag.Withdraw, e.detail.mintAddress);
    });
    this.#store.listen(ActionEventTag.Repay, e => {
      this.show(ActionEventTag.Repay, e.detail.mintAddress);
    });

    this.#store.listen(TransactionEventTag.Processing, () => {
      this.#panels.forEach(p => p.enable = false);
    });
    this.#store.listen(TransactionEventTag.Complete, () => {
      this.#panels.forEach(p => p.enable = true);
      this.close();
    });
    this.#store.listen(TransactionEventTag.Error, () => {
      this.#panels.forEach(p => p.enable = true);
    });
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.overlay);
    rootElem.addEventListener("click", () => {
      this.close();
    });
    return rootElem;
  }

  public show(tag: ActionEventTag, mintAddress: PublicKey) {
    const index = this.#getIndexByActionEventTag(tag);
    this.visible = true;

    document.body.classList.add(css.nonScroll);
    document.body.addEventListener("keyup", this.#onEscPress);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.#cachedMint = mintAddress;
    this.#showTabs(index, mintAddress);
    this.#showPanel(index, mintAddress);
  }

  public close() {
    this.visible = false;
    document.body.classList.remove(css.nonScroll);
    document.body.removeEventListener("keyup", this.#onEscPress);
  }

  #getIndexByActionEventTag(tag: ActionEventTag) {
    const index = this.#actionIndices.get(tag);
    Assert.some(index, "No index for tag");
    return index;
  }

  #showTabs(index: number, mintAddress: PublicKey) {
    const market = this.#store.marketChecked;
    const reserve = market.getReserveByMintChecked(mintAddress);

    // Hide borrow actions for supply only assets.
    if (reserve.stats.reserveBorrowLimit.isZero()) {
      this.#tabs.hideTab(this.#getIndexByActionEventTag(ActionEventTag.Borrow));
      this.#tabs.hideTab(this.#getIndexByActionEventTag(ActionEventTag.Repay));
    } else {
      this.#tabs.unhideAllTabs();
    }

    this.#tabs.selectTab(index, true);
  }

  #showPanel(index: number, mintAddress: PublicKey) {
    this.#panels.forEach((panel, i) => {
      if (i === index) {
        panel.show(mintAddress);
      } else {
        panel.hide();
      }
    });
  }
}