import { Store } from "./store";
import { WalletConnect } from "./wallet_connect";
import { BorrowsTable, DepositsTable } from "./obligation_tables";
import { ReservesTable } from "./reserves_table";
import { ActionForm } from "./action_form";
import {
  listen,
  ActionEventTag,
  MarketEventTag,
  ObligationEventTag,
} from "./events";

import * as css from "./app.css";

window.onload = async () => {
  const store = new Store();

  const appContainer = document.getElementById("app")!;
  const headerContainer = document.createElement("div");
  const controlsContainer = document.createElement("div");
  const obligationContainer = document.createElement("div");
  const reservesContainer = document.createElement("div");

  appContainer.classList.add(css.app);
  controlsContainer.classList.add(css.controlsContainer);
  obligationContainer.classList.add(css.obligationContainer);

  appContainer.appendChild(headerContainer);
  appContainer.appendChild(controlsContainer);
  appContainer.appendChild(obligationContainer);
  appContainer.appendChild(reservesContainer);

  const walletConnect = new WalletConnect(store.wallet);
  walletConnect.mount(headerContainer);

  const refreshMarketButton = document.createElement("button");
  refreshMarketButton.textContent = "Refresh market";
  refreshMarketButton.classList.add(css.updateMarketButton);
  refreshMarketButton.addEventListener("click", async () => {
    await store.refresh();
  });
  controlsContainer.appendChild(refreshMarketButton);

  const actionForm = new ActionForm(store);
  actionForm.mount(appContainer);

  const depositsTable = new DepositsTable();
  const borrowsTable = new BorrowsTable();
  depositsTable.mount(obligationContainer);
  borrowsTable.mount(obligationContainer);

  const reservesTable = new ReservesTable(store);
  reservesTable.mount(reservesContainer);

  listen(MarketEventTag.Loading, () => {
    depositsTable.enable = false;
    borrowsTable.enable = false;
    reservesTable.enable = false;
    refreshMarketButton.setAttribute("disabled", "true");
  });
  listen(MarketEventTag.Loaded, e => {
    reservesTable.refresh(e.detail.market);
    refreshMarketButton.removeAttribute("disabled");
  });
  listen(MarketEventTag.Error, e => {
    console.error(e.detail.error);
    alert(`Can not fetch market: ${JSON.stringify(e.detail.error)}`);
    refreshMarketButton.removeAttribute("disabled");
  });

  listen(ObligationEventTag.Loading, () => {
    depositsTable.enable = false;
    borrowsTable.enable = false;
  });
  listen(ObligationEventTag.Loaded, e => {
    const { detail: { obligation, context: { market } } } = e;
    depositsTable.refresh(market, obligation);
    borrowsTable.refresh(market, obligation);
  });
  listen(ObligationEventTag.Error, e => {
    console.error(e);
    alert(`Can not fetch obligation: ${JSON.stringify(e.detail.error)}`);

    depositsTable.enable = false;
    borrowsTable.enable = false;
  });

  listen(ActionEventTag.Supply, e => {
    actionForm.show(ActionEventTag.Supply, e.detail.mintAddress);
  });
  listen(ActionEventTag.Borrow, e => {
    actionForm.show(ActionEventTag.Borrow, e.detail.mintAddress);
  });
  listen(ActionEventTag.Withdraw, e => {
    actionForm.show(ActionEventTag.Withdraw, e.detail.mintAddress);
  });
  listen(ActionEventTag.Repay, e => {
    actionForm.show(ActionEventTag.Repay, e.detail.mintAddress);
  });

  await store.refresh();
};