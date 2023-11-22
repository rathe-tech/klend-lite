import Solflare from "@solflare-wallet/sdk";
import * as css from "./wallet_connect.css";

export class WalletConnect {
  #wallet: Solflare;
  #rootElem: HTMLElement;

  public get wallet() {
    return this.#wallet;
  }

  public constructor() {
    this.#wallet = new Solflare({ network: "mainnet-beta" });
    this.#rootElem = document.createElement("div");
    this.#rootElem.classList.add(css.root);

    const walletLabel = document.createElement("div");
    walletLabel.textContent = this.#wallet.isConnected ? this.#wallet.publicKey!.toBase58() : "";
    this.#rootElem.appendChild(walletLabel);

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
    this.#rootElem.appendChild(connectButton);

    this.#wallet.on("connect", () => {
      walletLabel.textContent = this.#wallet.publicKey!.toBase58();
      connectButton.textContent = "Disconnect";
    });
    this.#wallet.on("disconnect", () => {
      walletLabel.textContent = "";
      connectButton.textContent = "Connect (Solflare only)";
    });
  }

  public mount(parent: HTMLElement) {
    parent.appendChild(this.#rootElem);
  }
}