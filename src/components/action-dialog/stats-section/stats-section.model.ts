import Decimal from "decimal.js";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoObligation, KaminoReserve, calculateAPYFromAPR } from "@kamino-finance/klend-sdk";
import { UIPercent } from "@misc/utils";
import { ActionKind } from "../action-form";

export function useStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  return useMemo(() => {
    const supplyAPY = computeSupplyApyStats(kind, amount, reserve, slot);
    const borrowAPY = computeBorrowApyStats(kind, amount, reserve, slot);
    const utilization = computeUtilizationStats(kind, amount, reserve, slot);
    return { supplyAPY, borrowAPY, utilization };
  }, [kind, amount, reserve, slot]);
}

function computeSupplyApyStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  const current = reserve.stats.supplyInterestAPY;
  const projected = computeProjectedSupplyAPY(kind, amount, reserve, slot);
  const explanation = explainDiff(current, projected, UIPercent.fromNumberFraction);
  return { current, projected, explanation };
}

function computeProjectedSupplyAPY(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number
) {
  if (amount == null || amount.isZero()) return;

  const apr = reserve.calcSimulatedSupplyAPR(amount, ActionKind.toActionType(kind), slot, 0);
  return calculateAPYFromAPR(apr);
}

function computeBorrowApyStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  const current = reserve.stats.borrowInterestAPY;
  const projected = computeProjectedBorrowAPY(kind, amount, reserve, slot);
  const explanation = explainDiff(current, projected, UIPercent.fromNumberFraction);
  return { current, projected, explanation };
}

function computeProjectedBorrowAPY(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number
) {
  if (amount == null || amount.isZero()) return;

  const apr = reserve.calcSimulatedBorrowAPR(amount, ActionKind.toActionType(kind), slot, 0);
  return calculateAPYFromAPR(apr);
}

function computeProjectedLTV(
  kind: ActionKind,
  amount: Decimal | undefined,
  market: KaminoMarket,
  mintAddress: PublicKey,
  obligation: KaminoObligation | undefined | null,
) {
  if (obligation == null) return;
  if (amount == null || amount.isZero()) return;

  const { stats } = obligation.getSimulatedObligationStats(amount, ActionKind.toActionType(kind), mintAddress, market, market.reserves);
  return UIPercent.fromDecimalFraction(stats.loanToValue);
}

function computeUtilizationStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  const current = reserve.calculateUtilizationRatio();
  const projected = computeProjectedUtilization(kind, amount, reserve, slot);
  const explained = explainDiff(current, projected, UIPercent.fromNumberFraction);
  return { current, projected, explained };
}

function computeProjectedUtilization(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  if (amount == null || amount.isZero()) return;
  return reserve.calcSimulatedUtilizationRatio(amount, ActionKind.toActionType(kind), slot, 0);
}

function explainDiff<T>(current: T, projected: T | undefined, formatter: (value: T) => string) {
  if (projected == null) return formatter(current);
  return `${formatter(current)} → ${formatter(projected)}`;
}