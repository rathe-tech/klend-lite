import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";

import { UIUtils } from "@misc/utils";
import { MarketInfo } from "@misc/config";

export interface UIReserve {
  address: PublicKey;
  symbol: string;
  mintAddress: PublicKey;
  price: string;
  ltv: string;
  borrowFactor: string;
  currentSupply: string;
  maxSupply: string;
  supplyApy: string;
  currentBorrow: string;
  maxBorrow: string;
  borrowApy: string;
  isBorrowable: boolean;
}

export function useReserves({
  marketAddress,
  reserves,
}: {
  marketAddress: string,
  reserves: Map<PublicKey, KaminoReserve>
}) {
  return useMemo(() => {
    const reservesOrder = chooseReservesOrder(marketAddress);

    return Array.from(reserves.values()).map(r => {
      const order = reservesOrder.get(r.address.toBase58());
      return [r, order] as [KaminoReserve, number | undefined];
    }).sort((l, r) => {
      if (l[1] == undefined) return -1;
      if (r[1] == undefined) return 1;

      return l[1] - r[1];
    }).map(([r, _]) => toUIReserve(r));
  }, [marketAddress, reserves]);
}

function toUIReserve(reserve: KaminoReserve): UIReserve {
  const {
    stats: {
      decimals,
      mintAddress,
      loanToValuePct,
      borrowFactor,
      reserveDepositLimit,
      supplyInterestAPY,
      reserveBorrowLimit,
      borrowInterestAPY,
    }
  } = reserve;

  return {
    address: reserve.address,
    symbol: reserve.getTokenSymbol(),
    mintAddress,
    price: UIUtils.toUIPrice(reserve.getOracleMarketPrice()),
    ltv: loanToValuePct.toFixed(2),
    borrowFactor: (borrowFactor / 100).toFixed(2),
    currentSupply: UIUtils.toUINumber(reserve.getTotalSupply(), decimals),
    maxSupply: UIUtils.toUINumber(reserveDepositLimit, decimals),
    supplyApy: UIUtils.toPercent(supplyInterestAPY, 4),
    currentBorrow: UIUtils.toUINumber(reserve.getBorrowedAmount(), decimals),
    maxBorrow: UIUtils.toUINumber(reserveBorrowLimit, decimals),
    borrowApy: UIUtils.toPercent(borrowInterestAPY, 4),
    isBorrowable: !reserveBorrowLimit.isZero(),
  };
}

const MAIN_MARKET_RESERVES_ORDER = new Map([
  // Core assets
  new PublicKey("d4A2prbA2whesmvHaL88BH6Ewn5N4bTSU2Ze8P6Bc4Q"),  /* SOL */
  new PublicKey("D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59"), /* USDC */
  new PublicKey("H3t6qZ1JkguCNTi9uzVKqQ7dvt2cum4XiXWom6Gn5e5S"), /* USDT */
  // xSOL assets
  new PublicKey("FBSyPnxtHKLBZ4UeeUyAnbtFuAmTHLtso9YtsqRDRWpM"), /* MSOL */
  new PublicKey("H9vmCVd77N1HZa36eBn3UnftYmg4vQzPfm1RxabHAMER"), /* bSOL */
  new PublicKey("EVbyPKrHG6WBfm4dLxLMJpUDY43cCAcHSpV3KYjKsktW"), /* JITOSOL */
  // Blue chip assets
  new PublicKey("Hcz1o77tF9TpdEHcvrx29tz7SBKoQEwJA1wuJqGZYnTw"), /* tBTC */
  new PublicKey("febGYTnFX4GbSGoFHFeJXUHgNaK53fB23uDins9Jp1E"),  /* ETH */
  new PublicKey("EAA3VVsxUuQB1Tm5x7TJkq9ATtiX5Qwq8ok7gXwim7oo"), /* JLP */
  new PublicKey("DaGyAQJrdkLCzYZiUWg49NV8vabDnhR7ETwLu5eQgL56"), /* USDH */
  new PublicKey("GhGPbkWmPjSkbkgZbhNGBTxzwQKjqDpZwNfaf2gQKgdG"), /* UXD */
  new PublicKey("9Ukd2MSw5RvVFaN8jLhWxjHLEGiF1F6Hf7v3Zq5hZsKB"), /* JTO */
  new PublicKey("4AFAGAm5G8fkcKy7QerL88E7BiSE22ZRbvJzvaKjayor"), /* JUP */
  // kTokens assets
  new PublicKey("57U9pEC8NsWvHgWywd2xHTRkGQzWWYsWivxYRhtxZrLB"), /* kSOLBSOLOrca */
  new PublicKey("75WrtSz7rLCdBvAQhtHi8M2jC8HnpT8iUxcYkdeawr37"), /* kSOLJITOSOLRaydium */
  new PublicKey("FPAwg5jadDs8AvUtvtAbit2RCZdkZES6yY5X6nCSuEw9"), /* kSOLMSOLRaydium */
  new PublicKey("AxuWrPrJfwrUTvCWRxpkSQct6q8k1YSJzxhyYw2AAmv2"), /* kUXDUSDCOrca */
  // Other assets
  new PublicKey("G31zKdH2SkDZPhmoQraep5xbTSPyk3VZxAeBdC3nmq5J"), /* STEP */
  new PublicKey("Ggn9EUzL5QQPM8JPsyu1MU1uD3rGJty7iXddLQnmxPyS"), /* xSTEP */
  new PublicKey("5YpGenXaAowj4HS33AvirVb8P4tgue7S7YaY6MyYZ7LD"), /* CHAI */
  new PublicKey("9JB9EMxEp9gZy3i1jqD2yvNYWKRZCP6f3drdQw853swH"), /* STSOL */
].map((r, i) => [r.toBase58(), i]));

const JLP_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("Ga4rZytCpq1unD4DbEJ5bkHeUz9g3oh9AAFEi6vSauXp"), /* USDC */
  new PublicKey("DdTmCCjv7zHRD1hJv3E8bpnSEQBzdKkzB1j9ApXX5QoP"), /* JLP */
].map((r, i) => [r.toBase58(), i]));

const ALTCOINS_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("9TD2TSv4pENb8VwfbVYg25jvym7HN6iuAR6pFNSrKjqQ"), /* USDC */
  new PublicKey("G9T3ajJ5NL4m5v3bbu5KuSmVojWgaMGufDorLAHgJuYE"), /* USDH */
  new PublicKey("Hy2S5arXGFgsvze47PCgSjF92ZQCiAfUJnFkqZQMXu4T"), /* INF */
  new PublicKey("CoFdsnQeCUyJefhKK6GQaAPT9PEx8Xcs2jejtp9jgn38"), /* BONK */
  new PublicKey("GvPEtF7MsZceLbrrjprfcKN9quJ7EW221c4H9TVuWQUo"), /* WIF */
  new PublicKey("HXSE82voKcf8x2rdeLr73yASNhzWWGcTz3Shq6UFaEHA"), /* PYTH */
  new PublicKey("8PYYKF4ZvteefFBmtb9SMHmhZKnDWQH86z59mPZBfhHu"), /* JTO */
  new PublicKey("3AKyRviT87dt9jP3RHpfFjxmSVNbR68Wx7UejnUyaSFH"), /* JUP */
  new PublicKey("G6wtWpanuKmtqqjkpHpLsp21d7DKJpWQydKojGs2kuHQ"), /* WEN */
  new PublicKey("Dd7KhG2zJbrEDCq1rJJWg9mcDSfrdt3ExtzcA12zy1f9"), /* W */
  new PublicKey("E9Y7wNfjcHVhukm7tmqSke5DUhea5Rkq5oXhXFmcJ9GB"), /* TNSR */
].map((r, i) => [r.toBase58(), i]));

const MARKET_RESERVES_ORDERS = new Map([
  [MarketInfo.KNOWN_MARKETS[0].address.toBase58(), MAIN_MARKET_RESERVES_ORDER],
  [MarketInfo.KNOWN_MARKETS[1].address.toBase58(), JLP_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[2].address.toBase58(), ALTCOINS_MARKET_RESERVE_ORDER],
]);

function chooseReservesOrder(marketAddress: string) {
  return MARKET_RESERVES_ORDERS.get(marketAddress) ?? new Map();
}
