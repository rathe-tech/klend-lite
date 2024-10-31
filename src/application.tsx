import { useMemo, StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { NotificationProvider } from "@components/notifications";
import { SettingsProvider } from "@components/settings-context";
import { AppBar } from "@components/app-bar";
import { Donation } from "@components/donation";
import { Market } from "@components/market";
import { RpcConnectionProvider } from "@components/rpc-connection-context";
import { JitoClientProvider } from "@components/jito-client-context";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});

export const Application = () => {
  // For backward compatibility.
  const wallets = useMemo(() => [], []);

  return (
    <StrictMode>
      <NotificationProvider>
        <SettingsProvider>
          <JitoClientProvider>
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <RpcConnectionProvider>
                  <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                      <AppBar />
                      <Routes>
                        <Route index element={<Market />} />
                        <Route path="/market/:marketAddress" element={<Market />} />
                        <Route path="/donation" element={<Donation />} />
                      </Routes>
                    </WalletModalProvider>
                  </WalletProvider>
                </RpcConnectionProvider>
              </QueryClientProvider>
            </BrowserRouter>
          </JitoClientProvider>
        </SettingsProvider>
      </NotificationProvider>
    </StrictMode>
  );
};