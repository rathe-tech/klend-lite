import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

import { NavBar } from "./components/nav-bar";
import { Legacy } from "./components/legacy";
import { RPC_ENDPOINT } from "./config";

export const Application = () => {
  const wallets = React.useMemo(() => [
    new SolflareWalletAdapter(),
    new PhantomWalletAdapter()
  ], []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ConnectionProvider
          endpoint={RPC_ENDPOINT}
          config={{ commitment: "confirmed" }}
        >
          <WalletProvider
            wallets={wallets}
            autoConnect
          >
            <WalletModalProvider>
              <NavBar />
              <Legacy />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};