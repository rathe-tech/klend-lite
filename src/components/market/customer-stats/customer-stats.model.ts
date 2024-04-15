import { useMemo } from "react";
import { KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";
import { UIUtils } from "../../../utils";

export function useCustomerStats(obligation: KaminoObligation | null | undefined) {
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
      ltv: UIUtils.toFormattedPercent(loanToValue),
      maxLtv: UIUtils.toFormattedPercent(borrowLimit.div(userTotalDeposit)),
      liquidationLtv: UIUtils.toFormattedPercent(liquidationLtv)
    }
  }, [obligation]);
}