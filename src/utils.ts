import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";

export module Option {
  /**
   * Performs a value check against null or undefined. If the value is not null or undefined returns it.
   * @param value A value to unwrap to a given <T> type.
   * @param message A message to throw if the given value is null or undefined.
   * @returns The unwrapped value.
   */
  export function unwrap<T>(value: T | null | undefined, message = "Value is null or undefined"): T {
    if (value == null) {
      throw new Error(message);
    }
    return value;
  }
}

export module Assert {
  /**
   * Asserts a value is not null or undefined.
   * @param value A possible null or undefined value to check.
   * @param message A message to throw if the value is none.
   */
  export function some<T>(value: T | null | undefined, message = "Value is null or undefined"): asserts value is T {
    if (value == null) {
      throw new Error(message);
    }
  }

  /**
   * Asserts a value is true.
   * @param value A value to check.
   * @param message A message to throw if the value is false.
   */
  export function ok(value: boolean, message = "Value is false"): asserts value is true {
    if (!value) {
      throw new Error(message);
    }
  }
}

export module MapUtils {
  export function findUnusedKeys<K, V>(newMap: Map<K, V>, oldMap: Map<K, V>) {
    return [...oldMap.keys()].filter(k => !newMap.has(k));
  }
}

export module UIUtils {
  export function toUINumber(value: Decimal, decimals: number) {
    return value.div(10 ** decimals).toDecimalPlaces(decimals).toString();
  }

  export function toPercent(value: number, decimalPlaces: number) {
    return `${(value * 100).toFixed(decimalPlaces)} %`;
  }

  export function toNativeNumber(value: number | string, decimals: number) {
    return new Decimal(value)
      .toDecimalPlaces(decimals)
      .mul(10 ** decimals)
      .floor();
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

  export function sortReserves(reserves: KaminoReserve[]) {
    return reserves.map(r => {
      const order = RESERVES_ORDER.get(r.address.toBase58());
      return [r, order] as [KaminoReserve, number | undefined];
    }).sort((l, r) => {
      if (l[1] == undefined) return -1;
      if (r[1] == undefined) return 1;

      return l[1] - r[1];
    }).map(([r, _]) => r);
  }
}