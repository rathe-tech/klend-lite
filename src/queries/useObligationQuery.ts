import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import {
  KaminoMarket,
  VanillaObligation,
  PROGRAM_ID,
} from "@hubbleprotocol/kamino-lending-sdk";

export function useObligationQuery(market: KaminoMarket | null | undefined, walletAddress: PublicKey | null) {
  return useQuery({
    queryKey: ["obligation", market?.address, walletAddress?.toBase58()],
    queryFn: async ({ queryKey: [_obligation, _marketAddress, walletAddress] }) => {
      const obligationType = new VanillaObligation(PROGRAM_ID);
      return await market!.getObligationByWallet(new PublicKey(walletAddress!), obligationType);
    },
    enabled: !!market && !!walletAddress,
  });
}