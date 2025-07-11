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
  hide?: boolean;
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
      name: "Sanctum Market",
      address: new PublicKey("eNLm5e5KVDX2vEcCkt75PpZ2GMfXcZES3QrFshgpVzp"),
      lutAddress: new PublicKey("EZgA8QnSfXLVhijCho5DYGakiSA9kyz5FDB4dbgt1xri"),
    }, {
      name: "Altcoins Market",
      address: new PublicKey("ByYiZxp8QrdN9qbdtaAiePN8AAr3qvTPppNJDpf5DVJ5"),
      lutAddress: new PublicKey("x2uEQSaqrZs5UnyXjiNktRhrAy6iNFeSKai9VNYFFuy"),
      hide: true,
    }, {
      name: "Maple Market",
      address: new PublicKey("6WEGfej9B9wjxRs6t4BYpb9iCXd8CpTpJ8fVSNzHCC5y"),
      lutAddress: new PublicKey("CC6dR5rz9tuhdxzvePGvVhqJPnBu9BFyc1qdRjxbquWZ"),
    }, {
      name: "Exponent Market",
      address: new PublicKey("F4Pn9mAvbUazDmWET5yYATTiyLHLaCRTWgGex4tiMXAs"),
      lutAddress: new PublicKey("CZ4WMyfH8BzkRsc6oXmhmj6ntjkBhdWB32aHrck3H8WM"),
    }, {
      name: "Fartcoin Market",
      address: new PublicKey("4UwtBqa8DDtcWV6nWFregeMVkGdfWfiYeFxoHaR2hm9c"),
      lutAddress: new PublicKey("BxHAiZXuTGxH1uT43e64679t5Z6QDtw1KHxJSqVTnXYr"),
      hide: true,
    }
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