import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { calculateAPYFromAPR, KaminoReserve } from "@kamino-finance/klend-sdk";

import { UIUtils, UIPercent } from "@misc/utils";
import { MarketInfo } from "@misc/config";

export interface UIReserve {
  address: PublicKey;
  symbol: string;
  mintAddress: PublicKey;
  price: string;
  maxLtv: string;
  liquidationLtv: string;
  borrowFactor: string;
  currentSupply: string;
  maxSupply: string;
  supplyApy: string;
  currentBorrow: string;
  maxBorrow: string;
  borrowApy: string;
  isBorrowable: boolean;
  isSuppliable: boolean;
}

export function useReserves({
  marketAddress,
  reserves,
  slot,
}: {
  marketAddress: string,
  reserves: Map<PublicKey, KaminoReserve>,
  slot: number,
}) {
  return useMemo(() => {
    const reservesOrder = chooseReservesOrder(marketAddress);
    const uiReserves = Array.from(reserves.values()).map(r => {
      const order = reservesOrder.get(r.address.toBase58());
      return [r, order] as [KaminoReserve, number | undefined];
    }).sort((l, r) => {
      if (l[1] == undefined) return -1;
      if (r[1] == undefined) return 1;

      return l[1] - r[1];
    }).map(([r, _]) => toUIReserve(r, slot));
    const active = uiReserves.filter(r => r.isBorrowable || r.isSuppliable);
    const paused = uiReserves.filter(r => !r.isBorrowable && !r.isSuppliable);
    return { active, paused };
  }, [marketAddress, reserves]);
}

function toUIReserve(reserve: KaminoReserve, slot: number): UIReserve {
  const {
    stats: {
      decimals,
      mintAddress,
      loanToValue,
      liquidationThreshold,
      borrowFactor,
      reserveDepositLimit,
      reserveBorrowLimit,
    }
  } = reserve;
  const borrowAPY = calculateAPYFromAPR(reserve.calculateBorrowAPR(slot, 0));
  const supplyAPY = calculateAPYFromAPR(reserve.calculateSupplyAPR(slot, 0));

  return {
    address: reserve.address,
    symbol: reserve.getTokenSymbol(),
    mintAddress,
    price: UIUtils.toUIPrice(reserve.getOracleMarketPrice()),
    maxLtv: loanToValue.toFixed(2),
    liquidationLtv: liquidationThreshold.toFixed(2),
    borrowFactor: (borrowFactor / 100).toFixed(2),
    currentSupply: UIUtils.toUINumber(reserve.getTotalSupply(), decimals),
    maxSupply: UIUtils.toUINumber(reserveDepositLimit, decimals),
    supplyApy: UIPercent.fromNumberFraction(supplyAPY),
    currentBorrow: UIUtils.toUINumber(reserve.getBorrowedAmount(), decimals),
    maxBorrow: UIUtils.toUINumber(reserveBorrowLimit, decimals),
    borrowApy: UIPercent.fromNumberFraction(borrowAPY),
    isBorrowable: !reserveBorrowLimit.isZero(),
    isSuppliable: !reserveDepositLimit.isZero(),
  };
}

const MAIN_MARKET_RESERVES_ORDER = new Map([
  // Core assets
  new PublicKey("d4A2prbA2whesmvHaL88BH6Ewn5N4bTSU2Ze8P6Bc4Q"),  /* SOL */
  new PublicKey("D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59"), /* USDC */
  new PublicKey("H3t6qZ1JkguCNTi9uzVKqQ7dvt2cum4XiXWom6Gn5e5S"), /* USDT */
  new PublicKey("2gc9Dm1eB6UgVYFBUN9bWks6Kes9PbWSaPaa9DqyvEiN"), /* PYUSDT */
  new PublicKey("ESCkPWKHmgNE7Msf77n9yzqJd5kQVWWGy3o5Mgxhvavp"), /* USDG */
  new PublicKey("EGPE45iPkme8G8C1xFDNZoZeHdP3aRYtaAfAQuuwrcGZ"), /* EURC */
  // xSOL assets
  new PublicKey("H9vmCVd77N1HZa36eBn3UnftYmg4vQzPfm1RxabHAMER"), /* bSOL */
  new PublicKey("FBSyPnxtHKLBZ4UeeUyAnbtFuAmTHLtso9YtsqRDRWpM"), /* MSOL */
  new PublicKey("EVbyPKrHG6WBfm4dLxLMJpUDY43cCAcHSpV3KYjKsktW"), /* JITOSOL */
  new PublicKey("DGQZWCY17gGtBUgdaFs1VreJWsodkjFxndPsskwFKGpp"), /* jupSOL */
  new PublicKey("CExamod1Ai3d1N8Vh7sBjt5xbZzb2VmGMAFocf7fxCzm"), /* hSOL */
  new PublicKey("CHBNUPdjeo2N5QkZY2uAqv7TW5EbCTMsfvaskCBuxbom"), /* vSOL */
  new PublicKey("6U9CnJYCQwHUEmf4Pq4oGVKHVvD29wZvtPbFNjYmgjaF"), /* bbSOL */
  new PublicKey("Fqjbo3L4NAyzPcy6swv1XXLm1c7tUTKWMDkjCo9mfSDq"), /* bnSOL */
  new PublicKey("B5uYvxUcwX5fCB4msGU4DaHh8k6fsSkKHNboy94F9vbt"), /* hubSOL */
  new PublicKey("Ht9NoB1udjpRqws1sCw1j2dL7MeTDHYCDdDFkbc1Arst"), /* bonkSOL */
  new PublicKey("2UFz8kwraHybFyKhGQRwAsE5NtNpAhWs2X5grGoS7hnQ"), /* picoSOL */
  new PublicKey("HMCXsf1jFUDbvGGhvUzCzwkKbmUhxhxz7gYZwXpTuReT"), /* laineSOL */
  new PublicKey("StGKGcLQoTsWzQ1tFY2bWqrdiuBhqdFE4niiAutQxQB"),  /* dSOL */
  new PublicKey("BvafE5Sm6rLrBbVRtJ2FkCzfNJQ2TjcL8bvPZULUDYrt"), /* cgntSOL */
  new PublicKey("CkgQnPbuHHwSv2mNdAKH79TKSqC6jsyttK9yh4MPH6z3"), /* dfdvSOL */
  new PublicKey("A2J2CEwmwa9aTKbEfNoik6YTyNep9GtvNjU65okWYhwn"), /* strongSOL */
  new PublicKey("HD93Fq3gmVh3J7euJJ5MBw8Ph3ebeMFS699JQePN4XgN"), /* jSOL */
  new PublicKey("HV9KsS5mB4b9CFhDJVKdfxWBAomYfUk5PeUsdgMQsUrB"), /* pSOL */
  // Blue chip assets
  new PublicKey("37Jk2zkz23vkAYBT66HM2gaqJuNg2nYLsCreQAVt5MWK"), /* cbBTC */
  new PublicKey("4Hyrqb9Mq7y1wkq4YoqHkPdPx3VQyFY3mxMj67naC1Cb"), /* xBTC */
  new PublicKey("Hcz1o77tF9TpdEHcvrx29tz7SBKoQEwJA1wuJqGZYnTw"), /* tBTC */
  new PublicKey("HYnVhjsvU1vBKTPsXs1dWe6cJeuU8E4gjoYpmwe81KzN"), /* wBTC */
  new PublicKey("febGYTnFX4GbSGoFHFeJXUHgNaK53fB23uDins9Jp1E"),  /* ETH */
  new PublicKey("EAA3VVsxUuQB1Tm5x7TJkq9ATtiX5Qwq8ok7gXwim7oo"), /* JLP */
  new PublicKey("BHUi32TrEsfN2U821G4FprKrR4hTeK4LCWtA3BFetuqA"), /* USDS */
  new PublicKey("Bpc4kAh29J3YDQUMJJdGdr1zBAhTQjC48R1B8YTWudsi"), /* FDUSD */
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

const SOLBLAZE_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("7ZqBu1zJSGradNPqGpQxwSezLvuk1vr6EqKwP9Ahrezc"), /* bSOL */
  new PublicKey("4oigbthMAgjTMPyw8dBxhxU59YMtvNDHqhpR3W4HAzBM"), /* SOL */
].map((r, i) => [r.toBase58(), i]));

const MARINADE_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("r7Tyu7QswfZncQwmTQBkG1fDd8N5tJdi4b8S6KiBtBj"), /* mSOL */
  new PublicKey("DQ126djx5db6SMCbejHLNxoosonVes3qW5eVVUQuT93v"), /* SOL */
].map((r, i) => [r.toBase58(), i]));

const JITO_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("6gTJfuPHEg6uRAijRkMqNc9kan4sVZejKMxmvx2grT1p"), /* SOL */
  new PublicKey("F9HdecRG8GPs9LEn4S5VfeJVEZVqrDJFR6bvmQTi22na"), /* JITOSOL */
].map((r, i) => [r.toBase58(), i]));

const SANCTUM_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("HRqCpwgsHBqHWqyuaf683cvPaWJgJf6fGuTWQVv1YZaC"), /* INF */
  new PublicKey("HaVsdBb4mMoYQ3vnS7wCdvhixg5xFQALmFwyL9QJm3fn"), /* SOL */
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

const MAPLE_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("AwCyCPZYJSZ93xcVKNK7jR8e1BHzJXq1D4bReNuh9woY"), /* syrupUSDC */
  new PublicKey("Atj6UREVWa7WxbF2EMKNyfmYUY1U1txughe2gjhcPDCo"), /* USDC */
  new PublicKey("HokDw9LaDf9qNzJf4F21RjHU3K4pRBkGQENvWnRGyRbn"), /* USDG */
  new PublicKey("BiSRKTadXSiyTSpiqw9nJge33N32AXewUPY7skFJwMvA"), /* USDS */
].map((r, i) => [r.toBase58(), i]));

const EXPONENT_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("8sQ6biATvkuBaccpgJocvzgFCHTrfMUnSTYpFhA9JS7D"), /* SOL */
].map((r, i) => [r.toBase58(), i]));

const FARTCOIN_MARKET_RESERVE_ORDER = new Map([
  new PublicKey("F22tnLsbv66vEU2GZRc7coaqZsr8UcBbyp9V2kqWAiWK"), /* USDC */
].map((r, i) => [r.toBase58(), i]));

const MARKET_RESERVES_ORDERS = new Map([
  [MarketInfo.KNOWN_MARKETS[0].address.toBase58(), MAIN_MARKET_RESERVES_ORDER],
  [MarketInfo.KNOWN_MARKETS[1].address.toBase58(), JLP_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[2].address.toBase58(), SOLBLAZE_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[3].address.toBase58(), MARINADE_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[4].address.toBase58(), JITO_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[5].address.toBase58(), SANCTUM_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[6].address.toBase58(), ALTCOINS_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[7].address.toBase58(), MAPLE_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[8].address.toBase58(), EXPONENT_MARKET_RESERVE_ORDER],
  [MarketInfo.KNOWN_MARKETS[9].address.toBase58(), FARTCOIN_MARKET_RESERVE_ORDER],
]);

function chooseReservesOrder(marketAddress: string) {
  return MARKET_RESERVES_ORDERS.get(marketAddress) ?? new Map();
}
