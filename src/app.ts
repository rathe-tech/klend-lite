import { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { RPC_ENDPOINT } from "./config";
import { WalletConnect } from "./wallet_connect";
import { MarketFeed, MarketStatus } from "./market_feed";
import { ReservesTable } from "./reserves_table";

import * as css from "./app.css";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

window.onload = async () => {
  const connection = new Connection(RPC_ENDPOINT);
  const marketFeed = new MarketFeed(connection);

  const appContainer = document.getElementById("app")!;
  appContainer.classList.add(css.app);

  const walletConnect = new WalletConnect();
  walletConnect.mount(appContainer);

  const marketControls = document.createElement("div");
  marketControls.classList.add(css.marketControls);

  const refreshMarketButton = document.createElement("button");
  refreshMarketButton.textContent = "Refresh market";
  refreshMarketButton.classList.add(css.updateMarketButton);
  refreshMarketButton.addEventListener("click", async () => {
    marketFeed.refresh();
  });
  marketControls.appendChild(refreshMarketButton);
  appContainer.appendChild(marketControls);

  const reservesTable = new ReservesTable();
  reservesTable.mount(appContainer);

  marketFeed.on(MarketStatus.Loading, () => {
    reservesTable.enable = false;
    refreshMarketButton.setAttribute("disabled", "true");
  });
  marketFeed.on(MarketStatus.Loaded, market => {
    reservesTable.enable = true;
    reservesTable.refresh(market);
    refreshMarketButton.removeAttribute("disabled");
  });
  marketFeed.on(MarketStatus.Error, e => {
    console.error(e);
    alert(JSON.stringify(e));
    refreshMarketButton.removeAttribute("disabled");
  });

  document.addEventListener("klend:supply", e => {
    const { reserveAddress } = (e as CustomEvent).detail;
    alert(`Supply to: ${reserveAddress}`);
  });
  document.addEventListener("klend:borrow", e => {
    const { reserveAddress } = (e as CustomEvent).detail;
    alert(`Borrow from: ${reserveAddress}`);
  });

  const createTokenBtn = document.createElement("button");
  createTokenBtn.textContent = "create token";
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
  marketControls.appendChild(createTokenBtn);

  await marketFeed.refresh();
};