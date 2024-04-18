import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "@components/market-context";
import { Assert, UIUtils } from "@misc/utils";
import { ObligationTable, PositionKind, SkeletonObligationTable } from "./obligation-table";
import * as css from "./obligation.css";

export const Obligation = () => {
  const { marketState, obligationState } = useMarket();
  const { publicKey } = useWallet();

  if (!publicKey) {
    return;
  }

  if (obligationState.isPending) {
    return (
      <div className={css.obligationContainer}>
        <SkeletonObligationTable kind={PositionKind.Supplied} />
        <SkeletonObligationTable kind={PositionKind.Borrowed} />
      </div>
    );
  }

  const { data: market } = marketState;
  const { data: obligation } = obligationState;

  Assert.some(market);

  if (obligation == null) {
    return;
  }

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