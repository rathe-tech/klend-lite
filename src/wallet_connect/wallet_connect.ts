import { ControlBase } from "../controls";
import { Store, TransactionEventTag, WalletEventTag, CustomerEventTag } from "../models";
import * as css from "./wallet_connect.css";

export class WalletConnect extends ControlBase<HTMLDivElement> {
  #store: Store;
  #walletLabel: HTMLElement;
  #connectButton: HTMLElement;

  get #wallet() { return this.#store.wallet; }

  public override set enable(value: boolean) {
    if (value) {
      this.#connectButton.classList.remove(WalletConnect.css.disabled);
    } else {
      this.#connectButton.classList.add(WalletConnect.css.disabled);
    }
  }

  public override get isEnabled() {
    return this.#connectButton.classList.contains(WalletConnect.css.disabled);
  }

  public constructor(store: Store) {
    super();
    this.#store = store;

    this.#walletLabel = document.createElement("div");
    this.#walletLabel.textContent = this.#wallet.isConnected ? this.#wallet.publicKey!.toBase58() : "";
    this.rootElem.appendChild(this.#walletLabel);

    this.#connectButton = document.createElement("button");
    this.#connectButton.classList.add(css.connectButton);
    this.#connectButton.textContent = this.#wallet.isConnected ? "Disconnect" : "Connect (Solflare only)";
    this.#connectButton.addEventListener("click", async () => {
      if (this.#wallet.isConnected) {
        await this.#wallet.disconnect();
      } else {
        await this.#wallet.connect();
      }
    });
    this.rootElem.appendChild(this.#connectButton);

    this.#store.listen(WalletEventTag.Connect, e => {
      this.#walletLabel.textContent = e.detail.address.toBase58();
      this.#connectButton.textContent = "Disconnect";
    });
    this.#store.listen(WalletEventTag.Disconnect, () => {
      this.#walletLabel.textContent = "";
      this.#connectButton.textContent = "Connect (Solflare only)";
    });

    // Don not allow the user to disconnect their wallet while wallet-related ops are being processed.
    this.#store.listen(CustomerEventTag.Loading, () => this.enable = false);
    this.#store.listen(CustomerEventTag.Loaded, () => this.enable = true);
    this.#store.listen(CustomerEventTag.Error, () => this.enable = true);

    this.#store.listen(TransactionEventTag.Processing, () => this.enable = false);
    this.#store.listen(TransactionEventTag.Complete, () => this.enable = true);
    this.#store.listen(TransactionEventTag.Error, () => this.enable = true);
  }

  protected override createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.root);
    return rootElem;
  }
}