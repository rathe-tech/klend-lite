import { useMemo, StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { NotificationProvider } from "@components/notifications";
import { SettingsProvider } from "@components/settings-context";
import { SettingsDialog } from "@components/settings-dialog";
import { AppBar } from "@components/app-bar";
import { Donation } from "@components/donation";
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
                <SettingsProvider>
                  <NotificationProvider>
                    <AppBar />
                    <SettingsDialog />
                    <Routes>
                      <Route index element={<Market />} />
                      <Route path="/market/:marketAddress" element={<Market />} />
                      <Route path="/donation" element={<Donation />} />
                    </Routes>
                  </NotificationProvider>
                </SettingsProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
};