import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoObligation, KaminoReserve, calculateAPYFromAPR } from "@kamino-finance/klend-sdk";
import { UIPercent } from "@misc/utils";
import { ActionKind } from "../action-form";

export function computeProjectedSupplyAPY(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number
) {
  if (amount == null || amount.isZero()) return;

  const apr = reserve.calcSimulatedSupplyAPR(amount, ActionKind.toActionType(kind), slot, 0);
  return UIPercent.fromNumberFraction(calculateAPYFromAPR(apr));
}

export function computeProjectedBorrowAPY(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number
) {
  if (amount == null || amount.isZero()) return;

  const apr = reserve.calcSimulatedBorrowAPR(amount, ActionKind.toActionType(kind), slot, 0);
  return UIPercent.fromNumberFraction(calculateAPYFromAPR(apr));
}

export function computeProjectedLTV(
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

export function computeProjectedUtilization(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  if (amount == null || amount.isZero()) return;

  const utilization = reserve.calcSimulatedUtilizationRatio(amount, ActionKind.toActionType(kind), slot, 0);
  return UIPercent.fromNumberFraction(utilization);
}