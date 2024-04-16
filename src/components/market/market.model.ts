import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";

import { useMarketQuery } from "@queries/useMarketQuery";
import { useObligationQuery } from "@queries/useObligationQuery";
import { useTokenBalancesQuery } from "@queries/useTokenBalancesQuery";

import { chooseMarketInfo } from "@misc/config";

export function useMarketInfo() {
  const { marketAddress } = useParams();
  return useMemo(() => chooseMarketInfo(marketAddress), [marketAddress]);
}

export function useMarket() {
  const { connection } = useConnection();
  const { address } = useMarketInfo();
  return useMarketQuery(connection, address);
}

export function useObligation(market: KaminoMarket | null | undefined) {
  const { publicKey } = useWallet();
  return useObligationQuery(market, publicKey);
}

export function useTokenBalances(market: KaminoMarket | null | undefined) {
  const { publicKey } = useWallet();
  return useTokenBalancesQuery(market, publicKey);
}

export function useRefresh() {
  const { publicKey } = useWallet();
  const marketInfo = useMarketInfo();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const marketAddress = marketInfo.address.toBase58();
    await queryClient.invalidateQueries({ queryKey: ["market", marketAddress] });
    await queryClient.invalidateQueries({ queryKey: ["obligation", marketAddress, publicKey?.toBase58()] });
    await queryClient.invalidateQueries({ queryKey: ["balances", marketAddress, publicKey?.toBase58()] });
  }, [marketInfo.address, publicKey]);
}