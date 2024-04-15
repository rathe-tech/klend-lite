import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { KaminoMarket, VanillaObligation, PROGRAM_ID, KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";

import { Assert, Option } from "../../utils";
import { WSOL_MINT_ADDRESS, chooseMarketInfo } from "../../config";

export function useMarketInfo() {
  const { marketAddress } = useParams();
  return useMemo(() => chooseMarketInfo(marketAddress), [marketAddress]);
}

export function useMarket() {
  const { connection } = useConnection();
  const marketInfo = useMarketInfo();

  return useQuery({
    queryKey: ["market", marketInfo.address.toBase58()],
    queryFn: async ({ queryKey: [_, marketAddress] }) => {
      console.log("Fetch market");
      return await KaminoMarket.load(connection, new PublicKey(marketAddress));
    },
  });
}

export interface Customer {
  obligation: KaminoObligation | null;
  tokenBalances: Map<string, Decimal>;
}

export function useCustomer(market: KaminoMarket | null | undefined) {
  const { publicKey } = useWallet();
  const marketInfo = useMarketInfo();

  return useQuery({
    queryKey: ["customer", marketInfo.address.toBase58(), publicKey?.toBase58()],
    queryFn: async ({ queryKey: [_, _rawMarketAddress, rawWalletAddress] }) => {
      console.log("Fetch customer");
      const walletAddress = new PublicKey(Option.unwrap(rawWalletAddress));
      const obligationType = new VanillaObligation(PROGRAM_ID);
      const obligation = await market!.getObligationByWallet(walletAddress, obligationType);
      const tokenBalances = await loadTokenBalances(market!, walletAddress);
      return { obligation, tokenBalances };
    },
    enabled: !!publicKey && !!market,
  });
}

export function useRefresh() {
  const { publicKey } = useWallet();
  const marketInfo = useMarketInfo();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const marketAddress = marketInfo.address.toBase58();
    await queryClient.invalidateQueries({ queryKey: ["market", marketAddress] });
    await queryClient.invalidateQueries({ queryKey: ["customer", marketAddress, publicKey?.toBase58()] })
  }, [marketInfo.address, publicKey]);
}

async function loadTokenBalances(market: KaminoMarket, wallet: PublicKey) {
  const connection = market.getConnection();
  const solAccount = await connection.getAccountInfo(wallet);
  Assert.some(solAccount, "Native SOL account isn't loaded");

  const { value } = await connection.getTokenAccountsByOwner(wallet, { programId: TOKEN_PROGRAM_ID });
  const balances = new Map(value
    .map(x => AccountLayout.decode(x.account.data))
    .filter(({ mint }) => !!market.getReserveByMint(mint))
    .map(({ amount, mint }) => [mint.toBase58(), new Decimal(amount.toString(10))] as const));

  // Add native SOL balance.
  balances.set(WSOL_MINT_ADDRESS.toBase58(), new Decimal(solAccount.lamports));

  return balances;
}