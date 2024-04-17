import { MarketProvider, useMarket } from "@components/market-context";

import { Reserves } from "../reserves";
import { Obligation } from "../obligation";
import { ActionFormProvider } from "../action-form";

import { ObligationStats } from "../obligation-stats";
import { RefreshButton } from "./refresh-button";
import { Donation } from "../donation";

import * as css from "./market.css";

export const Market = () =>
  <MarketProvider>
    <div className={css.market}>
      <div className={css.marketBody}>
        <Content />
      </div>
    </div>
  </MarketProvider>

const Content = () => {
  const {
    marketState,
    obligationState,
    tokenBalancesState,
    refresh,
  } = useMarket();

  if (marketState.isPending) {
    return <div>Loading...</div>
  }

  if (marketState.isError) {
    return <div>Error</div>
  }

  if (marketState.data == null) {
    return <div>No data</div>
  }

  return (
    <ActionFormProvider
      market={marketState.data}
      obligation={obligationState.data}
      tokenBalances={tokenBalancesState.data}
    >
      <div className={css.customerStatsContainer}>
        <ObligationStats obligation={obligationState.data} />
        <RefreshButton
          refresh={refresh}
          isMarketFetching={marketState.isFetching}
          isCustomerFetching={obligationState.isFetching || tokenBalancesState.isFetching}
        />
      </div>
      {obligationState.data &&
        <Obligation
          market={marketState.data}
          obligation={obligationState.data}
        />
      }
      <Donation />
      <Reserves
        marketAddress={marketState.data.address}
        reserves={marketState.data.reservesActive}
        isEnabled={obligationState.isFetched && tokenBalancesState.isFetched}
      />
    </ActionFormProvider>
  );
};
