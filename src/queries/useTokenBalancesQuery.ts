import Decimal from "decimal.js";
import { useQuery } from "@tanstack/react-query";

import { PublicKey } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";

import { Assert, Option } from "../utils";
import { WSOL_MINT_ADDRESS } from "../config";

export function useTokenBalancesQuery(market: KaminoMarket | null | undefined, walletAddress: PublicKey | null) {
  return useQuery({
    queryKey: ["balances", market?.address, walletAddress?.toBase58()],
    queryFn: async ({ queryKey: [_balances, _marketAddress, rawWalletAddress] }) => {
      Assert.some(market, "Market can't be null");

      const connection = market.getConnection();
      const walletAddress = new PublicKey(Option.unwrap(rawWalletAddress))

      const solAccount = await connection.getAccountInfo(walletAddress);
      Assert.some(solAccount, "Native SOL account isn't loaded");

      const { value } = await connection.getTokenAccountsByOwner(walletAddress, { programId: TOKEN_PROGRAM_ID });
      const balances = new Map(value
        .map(x => AccountLayout.decode(x.account.data))
        .map(({ amount, mint }) => [mint.toBase58(), new Decimal(amount.toString(10))] as const));

      // Add native SOL balance.
      balances.set(WSOL_MINT_ADDRESS.toBase58(), new Decimal(solAccount.lamports));

      return balances;
    },
    enabled: !!market && !!walletAddress,
  });
}