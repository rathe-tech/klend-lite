import { ControlBase } from "../control_base";
import { Store, WalletEventTag } from "../store";
import * as css from "./wallet_connect.css";

export class WalletConnect extends ControlBase<HTMLDivElement> {
  #store: Store;
  get #wallet() { return this.#store.wallet; }

  public constructor(store: Store) {
    super();
    this.#store = store;

    const walletLabel = document.createElement("div");
    walletLabel.textContent = this.#wallet.isConnected ? this.#wallet.publicKey!.toBase58() : "";
    this.rootElem.appendChild(walletLabel);

    const connectButton = document.createElement("button");
    connectButton.classList.add(css.connectButton);
    connectButton.textContent = this.#wallet.isConnected ? "Disconnect" : "Connect (Solflare only)";
    connectButton.addEventListener("click", async () => {
      if (this.#wallet.isConnected) {
        await this.#wallet.disconnect();
      } else {
        await this.#wallet.connect();
      }
    });
    this.rootElem.appendChild(connectButton);

    this.#store.listen(WalletEventTag.Connect, e => {
      walletLabel.textContent = e.detail.address.toBase58();
      connectButton.textContent = "Disconnect";
    });
    this.#store.listen(WalletEventTag.Disconnect, () => {
      walletLabel.textContent = "";
      connectButton.textContent = "Connect (Solflare only)";
    });
  }

  protected override createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.root);
    return rootElem;
  }
}