import { useMemo, StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { AppBar } from "@components/app-bar";
import { MarketSelect } from "@components/market-select";
import { Market } from "@components/market";

import { RPC_ENDPOINT } from "@misc/config";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});

export const Application = () => {
  // For backward compatibility.
  const wallets = useMemo(() => [], []);

  return (
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider
            endpoint={RPC_ENDPOINT}
            config={{ commitment: "confirmed" }}
          >
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <AppBar />
                <MarketSelect />
                <Routes>
                  <Route index element={<Market />} />
                  <Route path="/market/:marketAddress" element={<Market />} />
                </Routes>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
};