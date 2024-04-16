import { KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";
import { useObligationStats } from "./obligation-stats.model";
import * as css from "./obligation-stats.css";

export const ObligationStats = ({ obligation }: { obligation: KaminoObligation | null | undefined }) => {
  const { borrowPower, ltv, maxLtv, liquidationLtv } = useObligationStats(obligation);

  return (
    <div className={css.stats}>
      <div className={css.statItem}>
        <div className={css.statLabel}>Borrow Power:</div>
        <div className={css.statValue}>{borrowPower}</div>
      </div>
      <div className={css.statItem}>
        <div className={css.statLabel}>LTV:</div>
        <div className={css.statValue}>{ltv}</div>
      </div>
      <div className={css.statItem}>
        <div className={css.statLabel}>Max LTV:</div>
        <div className={css.statValue}>{maxLtv}</div>
      </div>
      <div className={css.statItem}>
        <div className={css.statLabel}>Liquidation LTV:</div>
        <div className={css.statValue}>{liquidationLtv}</div>
      </div>
    </div>
  );
};