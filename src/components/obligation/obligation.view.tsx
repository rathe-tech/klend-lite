import { KaminoMarket, KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";
import { ObligationTable, PositionKind } from "./obligation-table";
import { UIUtils } from "../../utils";
import * as css from "./obligation.css";

export const Obligation = ({
  market,
  obligation,
}: {
  market: KaminoMarket,
  obligation: KaminoObligation,
}) =>
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