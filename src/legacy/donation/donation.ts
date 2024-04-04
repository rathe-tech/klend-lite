import { DONATION_ADDRESS } from "../../config";
import { ControlBase } from "../controls";
import * as css from "./donation.css";

export class Donation extends ControlBase<HTMLDivElement> {
  public constructor() {
    super();

    const title = document.createElement("div");
    const wallet = document.createElement("div");

    title.classList.add(css.title);
    title.textContent = "Like the service? Consider making a donation:";

    wallet.classList.add(css.wallet);
    wallet.textContent = DONATION_ADDRESS.toBase58();
    wallet.addEventListener("click", async () => {
      await navigator.clipboard.writeText(DONATION_ADDRESS.toBase58());
      alert("Wallet address copied!");
    });

    this.rootElem.appendChild(title);
    this.rootElem.appendChild(wallet);
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.root);
    return rootElem;
  }
}