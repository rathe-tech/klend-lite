import { useMarket } from "@components/market-context";
import { UIUtils } from "@misc/utils";
import { ObligationTable, PositionKind } from "./obligation-table";
import * as css from "./obligation.css";

export const Obligation = () => {
  const { marketState, obligationState } = useMarket();

  if (!marketState.data || !obligationState.data) {
    return;
  }

  const { data: market } = marketState;
  const { data: obligation } = obligationState;

  return (
    <div className={css.obligationContainer}>
      <ObligationTable
        kind={PositionKind.Supplied}
        market={market}
        positions={obligation.deposits}
        amount={UIUtils.toFormattedUsd(obligation.refreshedStats.userTotalDeposit)}
      />
      <ObligationTable
        kind={PositionKind.Borrowed}
        market={market}
        positions={obligation.borrows}
        amount={UIUtils.toFormattedUsd(obligation.refreshedStats.userTotalBorrow)}
      />
    </div>
  );
}