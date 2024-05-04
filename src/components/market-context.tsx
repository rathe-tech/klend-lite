import { createContext, memo, useCallback, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { MarketInfo } from "@misc/config";

import { useMarketQuery } from "@queries/useMarketQuery";
import { useObligationQuery } from "@queries/useObligationQuery";
import { useTokenBalancesQuery } from "@queries/useTokenBalancesQuery";
import { useSlotQuery } from "@queries/useSlotQuery";

export type SlotState = ReturnType<typeof useSlotQuery>;
export type MarketState = ReturnType<typeof useMarketQuery>;
export type ObligationState = ReturnType<typeof useObligationQuery>;
export type TokenBalancesState = ReturnType<typeof useTokenBalancesQuery>

export interface MarketContext {
  slotState: SlotState,
  marketInfo: MarketInfo;
  marketState: MarketState;
  obligationState: ObligationState;
  tokenBalancesState: TokenBalancesState;
  refresh: () => Promise<void>;
  hasError: () => boolean;
}

const MarketContext = createContext<MarketContext | null>(null);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  const { marketAddress } = useParams();
  const marketInfo = useMemo(() => MarketInfo.choose(marketAddress), [marketAddress]);

  const slotState = useSlotQuery(connection);
  const marketState = useMarketQuery(connection, marketInfo.address);
  const obligationState = useObligationQuery(marketState.data, publicKey);
  const tokenBalancesState = useTokenBalancesQuery(marketState.data, publicKey);

  const refresh = useCallback(async () => {
    const marketAddress = marketInfo.address.toBase58();
    await queryClient.invalidateQueries({ queryKey: ["slot"] });
    await queryClient.invalidateQueries({ queryKey: ["market", marketAddress] });
    await queryClient.invalidateQueries({ queryKey: ["obligation", marketAddress, publicKey?.toBase58()] });
    await queryClient.invalidateQueries({ queryKey: ["balances", marketAddress, publicKey?.toBase58()] });
  }, [marketInfo.address, publicKey]);

  const hasError = useCallback(() => {
    return slotState.isError || marketState.isError || obligationState.isError || tokenBalancesState.isError;
  }, [marketState, obligationState, tokenBalancesState]);

  return (
    <MarketContext.Provider value={{
      slotState,
      marketInfo,
      marketState,
      obligationState,
      tokenBalancesState,
      refresh,
      hasError,
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