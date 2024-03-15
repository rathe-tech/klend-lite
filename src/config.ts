import { PublicKey } from "@solana/web3.js";

export const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=66ef411d-8f9a-4ffd-97fe-7d5255ca0f0b";
export const DONATION_ADDRESS = new PublicKey("1DxMVkgaKW4sCNJcXGHGGEb2kv4Jh3Q4Wd9RjEvMP73");
export const WSOL_MINT_ADDRESS = new PublicKey("So11111111111111111111111111111111111111112");

export interface MarketInfo {
  name: string;
  address: PublicKey;
  lutAddress: PublicKey;
}

export const MARKETS: MarketInfo[] = [
  {
    name: "Main Market",
    address: new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF"),
    lutAddress: new PublicKey("284iwGtA9X9aLy3KsyV8uT2pXLARhYbiSi5SiM2g47M2"),
  }, {
    name: "JLP Market",
    address: new PublicKey("DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek"),
    lutAddress: new PublicKey("GprZNyWk67655JhX6Rq9KoebQ6WkQYRhATWzkx2P2LNc"),
  }, {
    name: "Altcoins Market",
    address: new PublicKey("ByYiZxp8QrdN9qbdtaAiePN8AAr3qvTPppNJDpf5DVJ5"),
    lutAddress: new PublicKey("x2uEQSaqrZs5UnyXjiNktRhrAy6iNFeSKai9VNYFFuy"),
  }
]