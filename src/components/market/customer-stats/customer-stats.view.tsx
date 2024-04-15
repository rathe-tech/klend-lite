import { KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";
import { useCustomerStats } from "./customer-stats.model";
import * as css from "./customer-stats.css";

export const CustomerStats = ({ obligation }: { obligation: KaminoObligation | null | undefined }) => {
  const { borrowPower, ltv, maxLtv, liquidationLtv } = useCustomerStats(obligation);

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