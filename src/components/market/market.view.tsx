import { MarketProvider, useMarket } from "@components/market-context";
import { MarketSelect } from "@components/market-select";
import { Reserves } from "../reserves";
import { Obligation } from "../obligation";
import { ObligationStats } from "../obligation-stats";
import { ActionFormProvider } from "../action-dialog";
import { RefreshButton } from "./refresh-button";
import * as css from "./market.css";

export const Market = () =>
  <MarketProvider>
    <MarketSelect />
    <div className={css.market}>
      <div className={css.marketBody}>
        <Content />
      </div>
    </div>
  </MarketProvider>

const Content = () => {
  const { hasError } = useMarket();

  if (hasError()) {
    return (
      <div>
        Some data could not be fetched. Please reload the page.
      </div>
    );
  }

  return (
    <ActionFormProvider>
      <div className={css.statsContainer}>
        <ObligationStats />
        <RefreshButton />
      </div>
      <Obligation />
      <Reserves />
    </ActionFormProvider>
  );
};