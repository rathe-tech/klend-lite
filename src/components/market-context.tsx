import { createContext, useCallback, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { MarketInfo } from "@misc/config";

import { useMarketQuery } from "@queries/useMarketQuery";
import { useObligationQuery } from "@queries/useObligationQuery";
import { useTokenBalancesQuery } from "@queries/useTokenBalancesQuery";

export interface MarketContext {
  marketInfo: MarketInfo;
  marketState: ReturnType<typeof useMarketQuery>;
  obligationState: ReturnType<typeof useObligationQuery>;
  tokenBalancesState: ReturnType<typeof useTokenBalancesQuery>;
  refresh: () => Promise<void>;
}

export const MarketContext = createContext<MarketContext | null>(null);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  const { marketAddress } = useParams();
  const marketInfo = useMemo(() => MarketInfo.choose(marketAddress), [marketAddress]);

  const marketState = useMarketQuery(connection, marketInfo.address);
  const obligationState = useObligationQuery(marketState.data, publicKey);
  const tokenBalancesState = useTokenBalancesQuery(marketState.data, publicKey);

  const refresh = useCallback(async () => {
    const marketAddress = marketInfo.address.toBase58();
    await queryClient.invalidateQueries({ queryKey: ["market", marketAddress] });
    await queryClient.invalidateQueries({ queryKey: ["obligation", marketAddress, publicKey?.toBase58()] });
    await queryClient.invalidateQueries({ queryKey: ["balances", marketAddress, publicKey?.toBase58()] });
  }, [marketInfo.address, publicKey]);

  return (
    <MarketContext.Provider value={{
      marketInfo,
      marketState,
      obligationState,
      tokenBalancesState,
      refresh,
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export function useMarket() {
  const context = useContext(MarketContext);
  if (context == null) {
    throw new Error("Could not use MarketContext outside MarketProvider");
  }

  return context;
}