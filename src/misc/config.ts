import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { Option } from "./utils";
import { version } from "../../package.json";

export const VERSION = version;
export const EXPLORER_URL = "https://solana.fm";
export const DONATION_ADDRESS = new PublicKey("GD6tdZfRDy8o45vkxJ6pq3RZR3ZV9XuCKsMQL4sikjXY");
export const WSOL_MINT_ADDRESS = new PublicKey("So11111111111111111111111111111111111111112");
export const ZERO = new Decimal(0);

export interface MarketInfo {
  name: string;
  address: PublicKey;
  lutAddress: PublicKey;
  main?: boolean;
}

export module MarketInfo {
  export const KNOWN_MARKETS: MarketInfo[] = [
    {
      name: "Main Market",
      address: new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF"),
      lutAddress: new PublicKey("284iwGtA9X9aLy3KsyV8uT2pXLARhYbiSi5SiM2g47M2"),
      main: true,
    }, {
      name: "JLP Market",
      address: new PublicKey("DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek"),
      lutAddress: new PublicKey("GprZNyWk67655JhX6Rq9KoebQ6WkQYRhATWzkx2P2LNc"),
    }, {
      name: "Solblaze Market",
      address: new PublicKey("C7h9YnjPrDvNhe2cWWDhCu4CZEB1XTTH4RzjmsHuengV"),
      lutAddress: new PublicKey("CPM1EHHTqYMoR4Kyp2fZTwrSWc9bXvoki8MgiaTR1ciu"),
    }, {
      name: "Marinade Market",
      address: new PublicKey("GVDUXFwS8uvBG35RjZv6Y8S1AkV5uASiMJ9qTUKqb5PL"),
      lutAddress: new PublicKey("9JLvnXRXEQTdqZjNUFpSZqh4WjNozQpmoM47XX8tY8Ua"),
    }, {
      name: "Jito Market",
      address: new PublicKey("H6rHXmXoCQvq8Ue81MqNh7ow5ysPa1dSozwW3PU1dDH6"),
      lutAddress: new PublicKey("7J58uyRavy93zY3NMStRJCKHd7G2kt7wu3mpscAUGte1"),
    }, {
      name: "Altcoins Market",
      address: new PublicKey("ByYiZxp8QrdN9qbdtaAiePN8AAr3qvTPppNJDpf5DVJ5"),
      lutAddress: new PublicKey("x2uEQSaqrZs5UnyXjiNktRhrAy6iNFeSKai9VNYFFuy"),
    }, {
      name: "Ethena Market",
      address: new PublicKey("BJnbcRHqvppTyGesLzWASGKnmnF1wq9jZu6ExrjT7wvF"),
      lutAddress: new PublicKey("5Cx8pxA2LuCPnt8RZG9LKjKc7PnzWwvCx6xJZis7MTwm"),
    },
  ] as const;

  export function choose(marketAddress: string | undefined | null) {
    if (marketAddress == null) {
      const market = KNOWN_MARKETS.find(x => x.main);
      return Option.unwrap(market);
    } else {
      const nativeMarketAddress = new PublicKey(marketAddress);
      const market = KNOWN_MARKETS.find(x => x.address.equals(nativeMarketAddress));
      return Option.unwrap(market);
    }
  }
}