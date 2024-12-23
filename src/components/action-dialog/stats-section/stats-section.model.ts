import Decimal from "decimal.js";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoObligation, KaminoReserve, calculateAPYFromAPR } from "@kamino-finance/klend-sdk";

import { ZERO } from "@misc/config";
import { UIPercent } from "@misc/utils";
import { ActionKind } from "../action-form";

export function useStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  mintAddress: PublicKey,
  market: KaminoMarket,
  obligation: KaminoObligation | null | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  return useMemo(() => {
    const supplyAPY = computeSupplyApyStats(kind, amount, reserve, slot);
    const borrowAPY = computeBorrowApyStats(kind, amount, reserve, slot);
    const utilization = computeUtilizationStats(kind, amount, reserve, slot);
    const ltv = computeLtvStats(kind, amount, mintAddress, market, obligation, slot);
    const protocolTakeRate = UIPercent.fromNumberFraction(reserve.stats.protocolTakeRate);
    const fixedHostInterestRate = UIPercent.fromDecimalFraction(reserve.getFixedHostInterestRate());
    return { supplyAPY, borrowAPY, utilization, ltv, protocolTakeRate, fixedHostInterestRate };
  }, [kind, amount, reserve, slot]);
}

function computeSupplyApyStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  reserve: KaminoReserve,
  slot: number,
) {
  const current = calculateAPYFromAPR(reserve.calculateSupplyAPR(slot, 0));
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
  const current = calculateAPYFromAPR(reserve.calculateBorrowAPR(slot, 0));
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

function computeLtvStats(
  kind: ActionKind,
  amount: Decimal | undefined,
  mintAddress: PublicKey,
  market: KaminoMarket,
  obligation: KaminoObligation | undefined | null,
  slot: number,
) {
  const current = obligation?.loanToValue() || ZERO;
  const projected = computeProjectedLTV(kind, amount, market, mintAddress, obligation, slot);
  const explained = explainDiff(current, projected, UIPercent.fromDecimalFraction);
  return { current, projected, explained };
}

function computeProjectedLTV(
  kind: ActionKind,
  amount: Decimal | undefined,
  market: KaminoMarket,
  mintAddress: PublicKey,
  obligation: KaminoObligation | undefined | null,
  slot: number,
) {
  if (obligation == null) return;
  if (amount == null || amount.isZero()) return;

  const action = ActionKind.toActionType(kind);
  const computeStats = () => {
    switch (action) {
      case "deposit":
        return obligation.getSimulatedObligationStats({
          amountCollateral: amount,
          amountDebt: new Decimal(0),
          action,
          mintDebt: undefined,
          mintCollateral: mintAddress,
          market,
          reserves: market.reserves,
          slot,
        });
      case "withdraw":
        return obligation.getSimulatedObligationStats({
          amountCollateral: amount,
          amountDebt: new Decimal(0),
          action,
          mintDebt: undefined,
          mintCollateral: mintAddress,
          market,
          reserves: market.reserves,
          slot,
        });
      case "borrow":
        return obligation.getSimulatedObligationStats({
          amountCollateral: new Decimal(0),
          amountDebt: amount,
          action,
          mintDebt: mintAddress,
          mintCollateral: undefined,
          market,
          reserves: market.reserves,
          slot,
        });
      case "repay":
        return obligation.getSimulatedObligationStats({
          amountCollateral: new Decimal(0),
          amountDebt: amount,
          action,
          mintDebt: mintAddress,
          mintCollateral: undefined,
          market,
          reserves: market.reserves,
          slot,
        });
      default:
        throw new Error(`Not supported action type; ${action}`);
    };
  };
  const { stats } = computeStats();
  return stats.loanToValue;
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