import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoReserve, Position } from "@kamino-finance/klend-sdk";
import { UIUtils } from "@misc/utils";

export interface MintInfo {
  mintAddress: PublicKey,
  symbol: string;
  decimals: number;
}

export interface UIPosition {
  mintAddress: PublicKey;
  symbol: string;
  amount: string;
  isBorrowable: boolean;
}

export enum PositionKind {
  Borrowed,
  Supplied,
}

export function usePositions({ market, positions }: { market: KaminoMarket, positions: Map<PublicKey, Position> }) {
  return useMemo(() => {
    return Array
      .from(positions.entries())
      .map(([_, position]) => toUIPosition({ reserve: market.getReserveByMint(position.mintAddress)!, position }));
  }, [positions]);
}

function toUIPosition({ reserve, position }: { reserve: KaminoReserve, position: Position }): UIPosition {
  return {
    mintAddress: position.mintAddress,
    symbol: reserve.getTokenSymbol(),
    amount: UIUtils.toUINumber(position.amount, reserve.stats.decimals),
    isBorrowable: !reserve.stats.reserveBorrowLimit.isZero()
  };
}