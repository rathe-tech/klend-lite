import { PublicKey } from "@solana/web3.js";
import { UIUtils } from "../utils";
import { ControlBase } from "../control_base";
import { WalletBalance } from "./wallet_balance";
import {
  Store,
  ActionEventTag,
  TransactionEventTag,
  type MintInfo
} from "../models";
import * as css from "./action_form.css";

export class ActionForm extends ControlBase<HTMLDivElement> {
  #store: Store;

  #formElem: HTMLElement;

  #headerElem: HTMLDivElement;
  #bodyElem: HTMLDivElement;
  #footerElem: HTMLDivElement;

  #titleElem: HTMLElement;
  #symbolElem: HTMLElement;
  #valueInput: HTMLInputElement;
  #submitElem: HTMLButtonElement;

  #walletBalance: WalletBalance;

  #onEscPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.close();
    }
  };
  #submit = async () => { };

  public constructor(store: Store) {
    super();

    this.#store = store;
    this.visible = false;

    this.#formElem = document.createElement("div");
    this.#formElem.classList.add(css.form);
    this.#formElem.addEventListener("click", e => {
      e.stopPropagation();
    });

    this.#headerElem = document.createElement("div");
    this.#bodyElem = document.createElement("div");
    this.#footerElem = document.createElement("div");

    this.#headerElem.classList.add(css.formHeader);
    this.#bodyElem.classList.add(css.formBody);
    this.#footerElem.classList.add(css.formFooter);

    this.#formElem.appendChild(this.#headerElem);
    this.#formElem.appendChild(this.#bodyElem);
    this.#formElem.appendChild(this.#footerElem);

    this.#titleElem = document.createElement("div");
    this.#walletBalance = new WalletBalance();
    this.#symbolElem = document.createElement("div");
    this.#valueInput = document.createElement("input");
    this.#submitElem = document.createElement("button");

    this.#titleElem.classList.add(css.title);
    this.#valueInput.classList.add(css.input);
    this.#submitElem.classList.add(css.submit);

    this.#headerElem.appendChild(this.#titleElem);
    this.#walletBalance.mount(this.#bodyElem);
    this.#bodyElem.appendChild(this.#symbolElem);
    this.#bodyElem.appendChild(this.#valueInput);
    this.#bodyElem.appendChild(this.#submitElem);

    this.#valueInput.type = "text";
    this.#valueInput.value = "0";

    this.#submitElem.textContent = "Submit";
    this.#submitElem.addEventListener("click", async () => {
      await this.#submit();
    });

    this.#store.listen(TransactionEventTag.Processing, () => {
      this.#submitElem.setAttribute("disabled", "true");
    });
    this.#store.listen(TransactionEventTag.Complete, () => {
      this.#submitElem.removeAttribute("disabled");
    });
    this.#store.listen(TransactionEventTag.Error, () => {
      this.#submitElem.removeAttribute("disabled");
    });

    this.rootElem.appendChild(this.#formElem);
  }

  protected override createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.overlay);
    rootElem.addEventListener("click", () => {
      this.close();
    });
    return rootElem;
  }

  public show(tag: ActionEventTag, mintAddress: PublicKey) {
    this.visible = true;

    document.body.classList.add(css.nonScroll);
    document.body.addEventListener("keyup", this.#onEscPress);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const { marketChecked: market, customerChecked: customer } = this.#store;
    const mint = market.getMintChecked(mintAddress);
    const balance = customer.getTokenBalance(mintAddress);

    this.#titleElem.textContent = chooseTitle(tag, mint);
    this.#walletBalance.updateBalance(balance, mint);
    this.#symbolElem.textContent = `${mint.symbol} Amount`;
    this.#valueInput.value = "0";

    this.#submit = async () => {
      const amount = UIUtils.toNativeNumber(this.#valueInput.value, mint.decimals);
      await this.#store.process(tag, mintAddress, amount);
    };
  }

  public close() {
    this.visible = false;
    document.body.classList.remove(css.nonScroll);
    document.body.removeEventListener("keyup", this.#onEscPress);
  }
}

export function chooseTitle(tag: ActionEventTag, { symbol }: MintInfo) {
  switch (tag) {
    case ActionEventTag.Borrow:
      return `Borrow ${symbol}`;
    case ActionEventTag.Supply:
      return `Supply ${symbol}`;
    case ActionEventTag.Repay:
      return `Repay ${symbol}`;
    case ActionEventTag.Withdraw:
      return `Withdraw ${symbol}`;
    default:
      throw new Error(`Not supported action: ${tag}`);
  }
}