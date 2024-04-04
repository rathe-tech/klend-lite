import { Store, CustomerEventTag, MarketEventTag } from "../models";
import { ControlBase } from "../controls";
import { WalletConnect } from "../wallet_connect";
import { BorrowsTable, DepositsTable } from "../obligation_tables";
import { ReservesTable } from "../reserves_table";
import { ActionForm } from "../action_form";
import { Donation } from "../donation";

import * as css from "./app.css";
import { MarketSelect } from "../market_select";
import { Stats } from "../stats";
import { version } from "../../../package.json";

export class App extends ControlBase<HTMLDivElement> {
  public constructor(store: Store) {
    super();

    const headerContainer = document.createElement("div");
    const marketSelectContainer = document.createElement("div");
    const controlsContainer = document.createElement("div");
    const obligationContainer = document.createElement("div");
    const reservesContainer = document.createElement("div");

    headerContainer.classList.add(css.headerContainer);
    marketSelectContainer.classList.add(css.marketSelectContainer);
    controlsContainer.classList.add(css.controlsContainer);
    obligationContainer.classList.add(css.obligationContainer);
    reservesContainer.classList.add(css.reservesContainer);

    this.rootElem.appendChild(headerContainer);
    this.rootElem.appendChild(marketSelectContainer);
    this.rootElem.appendChild(controlsContainer);
    this.rootElem.appendChild(obligationContainer);
    this.rootElem.appendChild(reservesContainer);

    const title = document.createElement("div");
    title.classList.add(css.appTitle);
    title.textContent = `KLEND LITE ${version}`;
    headerContainer.appendChild(title);

    const marketSelect = new MarketSelect();
    marketSelect.mount(marketSelectContainer);

    const walletConnect = new WalletConnect(store);
    walletConnect.mount(headerContainer);

    const stats = new Stats(store);
    stats.mount(controlsContainer);

    const refreshMarketButton = document.createElement("button");
    refreshMarketButton.textContent = "Refresh market";
    refreshMarketButton.classList.add(css.updateMarketButton);
    refreshMarketButton.addEventListener("click", async () => {
      await store.refresh();
    });
    controlsContainer.appendChild(refreshMarketButton);

    const actionForm = new ActionForm(store);
    actionForm.mount(this.rootElem);

    const depositsTable = new DepositsTable(store);
    const borrowsTable = new BorrowsTable(store);
    depositsTable.mount(obligationContainer);
    borrowsTable.mount(obligationContainer);

    const donation = new Donation();
    donation.mount(reservesContainer);

    const reservesTable = new ReservesTable(store);
    reservesTable.mount(reservesContainer);

    store.listen(MarketEventTag.Loading, () => {
      refreshMarketButton.setAttribute("disabled", "true");
    });
    store.listen(MarketEventTag.Loaded, () => {
      refreshMarketButton.removeAttribute("disabled");
    });
    store.listen(MarketEventTag.Error, () => {
      refreshMarketButton.removeAttribute("disabled");
    });

    store.listen(CustomerEventTag.Loading, () => {
      // Should be triggered after MarketEventTag.Loaded
      setTimeout(() => refreshMarketButton.setAttribute("disabled", "true"));
    });
    store.listen(CustomerEventTag.Loaded, () => {
      refreshMarketButton.removeAttribute("disabled");
    });
    store.listen(CustomerEventTag.Error, () => {
      refreshMarketButton.removeAttribute("disabled");
    });
  }

  protected createRootElem(): HTMLDivElement {
    const rootElem = document.createElement("div");
    rootElem.classList.add(css.app);
    return rootElem;
  }
}