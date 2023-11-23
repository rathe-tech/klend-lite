import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import Solflare from "@solflare-wallet/sdk";

import { RPC_ENDPOINT } from "./config";
import { WalletConnect } from "./wallet_connect";
import { MarketFeed, FeedStatus, ObligationFeed } from "./feeds";
import { DepositsTable } from "./deposits_table";
import { BorrowsTable } from "./borrows_table";
import { ReservesTable } from "./reserves_table";
import { SupplyForm } from "./supply_form";

import * as css from "./app.css";

window.onload = async () => {
  const connection = new Connection(RPC_ENDPOINT);
  const wallet = new Solflare({ network: "mainnet-beta" });
  const marketFeed = new MarketFeed(connection);
  const obligationFeed = new ObligationFeed(connection);

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

  const walletConnect = new WalletConnect(wallet);
  walletConnect.mount(headerContainer);

  const refreshMarketButton = document.createElement("button");
  refreshMarketButton.textContent = "Refresh market";
  refreshMarketButton.classList.add(css.updateMarketButton);
  refreshMarketButton.addEventListener("click", async () => {
    marketFeed.refresh();
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

  marketFeed.on(FeedStatus.Loading, () => {
    reservesTable.enable = false;
    refreshMarketButton.setAttribute("disabled", "true");
  });
  marketFeed.on(FeedStatus.Loaded, market => {
    reservesTable.enable = true;
    reservesTable.refresh(market);
    obligationFeed.market = market;
    refreshMarketButton.removeAttribute("disabled");
  });
  marketFeed.on(FeedStatus.Error, e => {
    console.error(e);
    alert(`Can not fetch market: ${JSON.stringify(e)}`);
    refreshMarketButton.removeAttribute("disabled");
  });

  obligationFeed.on(FeedStatus.Loading, () => {

  });
  obligationFeed.on(FeedStatus.Loaded, obligation => {
    console.log(obligation);
  });
  obligationFeed.on(FeedStatus.Error, e => {
    alert(`Can not fetch obligation: ${JSON.stringify(e)}`);
  });

  wallet.on("connect", () => {
    obligationFeed.wallet = wallet.publicKey!;
  });
  wallet.on("disconnect", () => {
    obligationFeed.wallet = null;
  });

  document.addEventListener("klend:supply", e => {
    const { reserveAddress } = (e as CustomEvent).detail;
    supplyForm.show(reserveAddress);
  });
  document.addEventListener("klend:borrow", e => {
    const { reserveAddress } = (e as CustomEvent).detail;
    alert(`Borrow from: ${reserveAddress}`);
  });

  const createTokenBtn = document.createElement("button");
  createTokenBtn.textContent = "Create token (test)";
  createTokenBtn.addEventListener("click", async () => {
    const { wallet } = walletConnect;
    const mint = new PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj");
    const ata = await getAssociatedTokenAddress(mint, wallet.publicKey!);
    const instruction = createAssociatedTokenAccountInstruction(wallet.publicKey!, ata, wallet.publicKey!, mint);

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey! }).add(instruction);
    const tx = await wallet.signAndSendTransaction(transaction);
    console.log(tx);
  });
  controlsContainer.appendChild(createTokenBtn);

  await marketFeed.refresh();
};