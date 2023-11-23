import Solflare from "@solflare-wallet/sdk";
import { ControlBase } from "../control_base";
import * as css from "./wallet_connect.css";

export class WalletConnect extends ControlBase<HTMLDivElement> {
  #wallet: Solflare;

  public get wallet() {
    return this.#wallet;
  }

  public constructor(wallet: Solflare) {
    super();
    this.#wallet = wallet;

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

    this.#wallet.on("connect", () => {
      walletLabel.textContent = this.#wallet.publicKey!.toBase58();
      connectButton.textContent = "Disconnect";
    });
    this.#wallet.on("disconnect", () => {
      walletLabel.textContent = "";
      connectButton.textContent = "Connect (Solflare only)";
    });
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.root);
    return rootElem;
  }
}