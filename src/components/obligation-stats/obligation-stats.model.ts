import { useMemo } from "react";
import { KaminoObligation } from "@kamino-finance/klend-sdk";
import { UIPercent, UIUtils } from "@misc/utils";

export function useObligationStats(obligation: KaminoObligation | null | undefined) {
  return useMemo(() => {
    if (obligation == null) {
      return { borrowPower: "-", ltv: "-", maxLtv: "-", liquidationLtv: "-" };
    }

    const {
      loanToValue,
      liquidationLtv,
      borrowLimit,
      userTotalDeposit,
      userTotalBorrowBorrowFactorAdjusted,
    } = obligation.refreshedStats;

    return {
      borrowPower: UIUtils.toFormattedUsd(borrowLimit.minus(userTotalBorrowBorrowFactorAdjusted)),
      ltv: UIPercent.fromDecimalFraction(loanToValue),
      maxLtv: UIPercent.fromDecimalFraction(borrowLimit.div(userTotalDeposit)),
      liquidationLtv: UIPercent.fromDecimalFraction(liquidationLtv)
    }
  }, [obligation]);
}