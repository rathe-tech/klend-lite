import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey } from "@solana/web3.js";
import { KaminoMarket } from "@kamino-finance/klend-sdk";
import { Assert } from "@misc/utils";

export function useMarketQuery(connection: Connection, marketAddress: PublicKey) {
  const marketCache = useMemo(() => new Map<string, KaminoMarket>(), [connection]);

  return useQuery({
    queryKey: ["market", marketAddress.toBase58()],
    queryFn: async ({ queryKey: [_, marketAddress] }) => {
      const cachedMarket = marketCache.get(marketAddress);
      if (cachedMarket) {
        await cachedMarket.refreshAll();
        return cachedMarket;
      } else {
        const market = await KaminoMarket.load(connection, new PublicKey(marketAddress));
        Assert.some(market, `Can't load market: ${marketAddress}`);
        marketCache.set(marketAddress, market);
        return market;
      }
    },
  });
}