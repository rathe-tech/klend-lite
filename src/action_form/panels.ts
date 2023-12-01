import { PublicKey } from "@solana/web3.js";

import { UIUtils } from "../utils";
import { ControlBase } from "../controls";
import { ActionEventTag, MintInfo, Store } from "../models";

import { WalletBalance } from "./wallet_balance";
import * as css from "./panels.css";

export abstract class Panel extends ControlBase<HTMLDivElement> {
  #store: Store;
  #tag: ActionEventTag;

  #walletBalance: WalletBalance;
  #valueLabel: HTMLLabelElement;
  #valueInput: HTMLInputElement;
  #submitButton: HTMLButtonElement;

  #submit = async () => { };

  protected get valueInput() {
    return this.#valueInput;
  }

  public constructor(store: Store, tag: ActionEventTag) {
    super();
    this.#store = store;
    this.#tag = tag;

    this.#walletBalance = new WalletBalance();
    this.#walletBalance.mount(this.rootElem);

    this.#valueLabel = document.createElement("label");
    this.#valueLabel.classList.add(css.label);
    this.rootElem.appendChild(this.#valueLabel);

    this.#valueInput = document.createElement("input");
    this.#valueInput.classList.add(css.input);
    this.rootElem.appendChild(this.#valueInput);

    this.#submitButton = document.createElement("button");
    this.#submitButton.classList.add(css.submit);
    this.#submitButton.textContent = "Submit";
    this.#submitButton.addEventListener("click", async () => {
      await this.#submit?.();
    });
    this.rootElem.appendChild(this.#submitButton);

    this.visible = false;
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.panel);
    return rootElem;
  }

  public show(mintAddress: PublicKey) {
    this.visible = true;

    const { marketChecked: market, customerChecked: customer } = this.#store;
    const mint = market.getMintChecked(mintAddress);
    const balance = customer.getTokenBalance(mintAddress);

    this.#valueLabel.textContent = chooseLabel(this.#tag, mint);
    this.#valueInput.value = "0";
    this.#walletBalance.updateBalance(balance, mint);
    this.#submit = async () => {
      const amount = UIUtils.toNativeNumber(this.#valueInput.value, mint.decimals);
      await this.#store.process(this.#tag, mintAddress, amount);
    };
  }

  public hide() {
    this.visible = false;
  }
}

export class SupplyPanel extends Panel {
  public constructor(store: Store) {
    super(store, ActionEventTag.Supply);
  }
}

export class BorrowPanel extends Panel {
  public constructor(store: Store) {
    super(store, ActionEventTag.Borrow);
  }
}

export class WithdrawPanel extends Panel {
  public constructor(store: Store) {
    super(store, ActionEventTag.Withdraw);
  }
}

export class RepayPanel extends Panel {
  public constructor(store: Store) {
    super(store, ActionEventTag.Repay);
  }
}

export function chooseLabel(tag: ActionEventTag, { symbol }: MintInfo) {
  switch (tag) {
    case ActionEventTag.Borrow:
      return `Amount of ${symbol} to borrow:`;
    case ActionEventTag.Supply:
      return `Amount of ${symbol} to supply:`;
    case ActionEventTag.Repay:
      return `Amount of ${symbol} to repay:`;
    case ActionEventTag.Withdraw:
      return `Amount of ${symbol} to withdraw:`;
    default:
      throw new Error(`Not supported action: ${tag}`);
  }
}