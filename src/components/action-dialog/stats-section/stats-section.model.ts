import { KaminoReserve, calculateAPYFromAPR } from "@kamino-finance/klend-sdk";
import { UIPercent, UIUtils } from "@misc/utils";
import { ActionKind } from "../action-form";

export function computeProjectedSupplyAPY(
  kind: ActionKind,
  rawAmount: string,
  decimals: number,
  reserve: KaminoReserve,
  slot: number
) {
  if (rawAmount.length === 0) return;

  const amount = UIUtils.toNativeNumber(rawAmount, decimals);
  if (amount.isZero()) return;

  const apr = reserve.calcSimulatedSupplyAPR(amount, ActionKind.toActionType(kind), slot, 0);
  return UIPercent.fromNumberFraction(calculateAPYFromAPR(apr));
}

export function computeProjectedBorrowAPY(
  kind: ActionKind,
  rawAmount: string,
  decimals: number,
  reserve: KaminoReserve,
  slot: number
) {
  if (rawAmount.length === 0) return;

  const amount = UIUtils.toNativeNumber(rawAmount, decimals);
  if (amount.isZero()) return;

  const apr = reserve.calcSimulatedBorrowAPR(amount, ActionKind.toActionType(kind), slot, 0);
  return UIPercent.fromNumberFraction(calculateAPYFromAPR(apr));
}

export function computeProjectedUtilization(
  kind: ActionKind,
  rawAmount: string,
  decimals: number,
  reserve: KaminoReserve,
  slot: number,
) {
  if (rawAmount.length === 0) return;

  const amount = UIUtils.toNativeNumber(rawAmount, decimals);
  if (amount.isZero()) return;

  const utilization = reserve.calcSimulatedUtilizationRatio(amount, ActionKind.toActionType(kind), slot, 0);
  return UIPercent.fromNumberFraction(utilization);
}