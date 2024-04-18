import { useMarket } from "@components/market-context";
import { useObligationStats } from "./obligation-stats.model";
import * as css from "./obligation-stats.css";

export const ObligationStats = () => {
  const { obligationState } = useMarket();
  const { borrowPower, ltv, maxLtv, liquidationLtv } = useObligationStats(obligationState.data);

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