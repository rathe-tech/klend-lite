import { Connection, PublicKey } from "@solana/web3.js";
import {
  KaminoMarket,
  KaminoReserve,
  ObligationType
} from "@hubbleprotocol/kamino-lending-sdk";
import { IndexedArray } from "./indexed_array";
import { Option } from "../utils";

export interface MintInfo {
  mintAddress: PublicKey;
  symbol: string;
  decimals: number;
}

export class Market {
  #nativeMarket: KaminoMarket;
  #mints: Map<string, MintInfo>;
  #reserves: IndexedArray<KaminoReserve>;

  private constructor(nativeMarket: KaminoMarket) {
    this.#nativeMarket = nativeMarket;
    this.#mints = extractMints(this.#nativeMarket);
    this.#reserves = extractReserves(this.#nativeMarket);
  }

  public getKaminoMarket() {
    return this.#nativeMarket;
  }

  public getMintAddresses() {
    return new Set(this.#mints.keys());
  }

  public getMint(mintAddress: PublicKey) {
    return this.#mints.get(mintAddress.toBase58());
  }

  public getMintChecked(mintAddress: PublicKey) {
    return Option.unwrap(this.getMint(mintAddress), `Could not get mint for: ${mintAddress}`);
  }

  public getReserves() {
    return this.#reserves.getArray();
  }

  public getReserveByMint(mintAddress: PublicKey) {
    return this.#reserves.getByKey(mintAddress.toBase58());
  }

  public getReserveByMintChecked(mintAddress: PublicKey) {
    return Option.unwrap(this.getReserveByMint(mintAddress), `Could not get reserve for mint: ${mintAddress}`);
  }

  public async getObligationByWallet(wallet: PublicKey, type: ObligationType) {
    return await this.#nativeMarket.getObligationByWallet(wallet, type);
  }

  public static async load(connection: Connection, marketAddress: PublicKey) {
    const nativeMarket = await KaminoMarket.load(connection, marketAddress);
    return nativeMarket == null ? null : new Market(nativeMarket);
  }
}

function extractMints({ reservesActive: reserves }: KaminoMarket) {
  return new Map(reserves.map(x => [x.stats.mintAddress.toBase58(), {
    mintAddress: new PublicKey(x.stats.mintAddress),
    symbol: x.stats.symbol,
    decimals: x.stats.decimals
  }]));
}

const RESERVES_ORDER = new Map([
  // Core assets
  new PublicKey("d4A2prbA2whesmvHaL88BH6Ewn5N4bTSU2Ze8P6Bc4Q") /* SOL */,
  new PublicKey("D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59") /* USDC */,
  new PublicKey("H3t6qZ1JkguCNTi9uzVKqQ7dvt2cum4XiXWom6Gn5e5S") /* USDT */,
  // xSOL assets
  new PublicKey("FBSyPnxtHKLBZ4UeeUyAnbtFuAmTHLtso9YtsqRDRWpM") /* MSOL */,
  new PublicKey("H9vmCVd77N1HZa36eBn3UnftYmg4vQzPfm1RxabHAMER") /* bSOL */,
  new PublicKey("EVbyPKrHG6WBfm4dLxLMJpUDY43cCAcHSpV3KYjKsktW") /* JITOSOL */,
  // Blue chip assets
  new PublicKey("Hcz1o77tF9TpdEHcvrx29tz7SBKoQEwJA1wuJqGZYnTw") /* tBTC */,
  new PublicKey("febGYTnFX4GbSGoFHFeJXUHgNaK53fB23uDins9Jp1E") /* ETH */,
  new PublicKey("EAA3VVsxUuQB1Tm5x7TJkq9ATtiX5Qwq8ok7gXwim7oo") /* JLP */,
  new PublicKey("DaGyAQJrdkLCzYZiUWg49NV8vabDnhR7ETwLu5eQgL56") /* USDH */,
  new PublicKey("GhGPbkWmPjSkbkgZbhNGBTxzwQKjqDpZwNfaf2gQKgdG") /* UXD */,
  new PublicKey("9Ukd2MSw5RvVFaN8jLhWxjHLEGiF1F6Hf7v3Zq5hZsKB") /* JTO */,
  // kTokens assets
  new PublicKey("57U9pEC8NsWvHgWywd2xHTRkGQzWWYsWivxYRhtxZrLB") /* kSOLBSOLOrca */,
  new PublicKey("75WrtSz7rLCdBvAQhtHi8M2jC8HnpT8iUxcYkdeawr37") /* kSOLJITOSOLRaydium */,
  new PublicKey("FPAwg5jadDs8AvUtvtAbit2RCZdkZES6yY5X6nCSuEw9") /* kSOLMSOLRaydium */,
  new PublicKey("AxuWrPrJfwrUTvCWRxpkSQct6q8k1YSJzxhyYw2AAmv2") /* kUXDUSDCOrca */,
  // Other assets
  new PublicKey("G31zKdH2SkDZPhmoQraep5xbTSPyk3VZxAeBdC3nmq5J") /* STEP */,
  new PublicKey("Ggn9EUzL5QQPM8JPsyu1MU1uD3rGJty7iXddLQnmxPyS") /* xSTEP */,
  new PublicKey("5YpGenXaAowj4HS33AvirVb8P4tgue7S7YaY6MyYZ7LD") /* CHAI */,
  new PublicKey("9JB9EMxEp9gZy3i1jqD2yvNYWKRZCP6f3drdQw853swH") /* STSOL */,
].map((r, i) => [r.toBase58(), i]));

function extractReserves({ reservesActive: reserves }: KaminoMarket) {
  const sorted = reserves.map(r => {
    const order = RESERVES_ORDER.get(r.address.toBase58());
    return [r, order] as [KaminoReserve, number | undefined];
  }).sort((l, r) => {
    if (l[1] == undefined) return -1;
    if (r[1] == undefined) return 1;

    return l[1] - r[1];
  }).map(([r, _]) => r);

  return new IndexedArray(sorted, r => r.stats.mintAddress.toBase58());
}