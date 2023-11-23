import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress
} from "@solana/spl-token";

import { Store } from "./store";

import { WalletConnect } from "./wallet_connect";
import { BorrowsTable, DepositsTable } from "./obligation_tables";
import { ReservesTable } from "./reserves_table";
import { SupplyForm } from "./supply_form";
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

  const supplyForm = new SupplyForm();
  supplyForm.mount(appContainer);

  const depositsTable = new DepositsTable();
  const borrowsTable = new BorrowsTable();
  depositsTable.mount(obligationContainer);
  borrowsTable.mount(obligationContainer);

  const reservesTable = new ReservesTable();
  reservesTable.mount(reservesContainer);

  listen(MarketEventTag.Loading, () => {
    depositsTable.enable = false;
    borrowsTable.enable = false;
    reservesTable.enable = false;
    refreshMarketButton.setAttribute("disabled", "true");
  });
  listen(MarketEventTag.Loaded, e => {
    const { detail: { market, context } } = e;
    reservesTable.refresh(market, context);
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
    supplyForm.show(e.detail.reserveAddress);
  });
  listen(ActionEventTag.Borrow, e => {
    alert(`Borrow from: ${e.detail.reserveAddress}`);
  });
  listen(ActionEventTag.Withdraw, e => {
    alert(`Withdraw for mint: ${e.detail.mintAddress}`);
  });
  listen(ActionEventTag.Repay, e => {
    alert(`Repay for mint: ${e.detail.mintAddress}`);
  });

  const createTokenBtn = document.createElement("button");
  createTokenBtn.textContent = "Create token (test)";
  createTokenBtn.addEventListener("click", async () => {
    const { wallet } = walletConnect;
    const mint = new PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj");
    const ata = await getAssociatedTokenAddress(mint, wallet.publicKey!);
    const instruction = createAssociatedTokenAccountInstruction(wallet.publicKey!, ata, wallet.publicKey!, mint);

    const { blockhash } = await store.connection.getLatestBlockhash();
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey! }).add(instruction);
    const tx = await wallet.signAndSendTransaction(transaction);
    console.log(tx);
  });
  controlsContainer.appendChild(createTokenBtn);

  await store.refresh();
};