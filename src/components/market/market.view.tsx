import { Reserves } from "../reserves";
import { Obligation } from "../obligation";
import { ActionFormProvider } from "../action-form"

import { CustomerStats } from "./customer-stats";
import { RefreshButton } from "./refresh-button";

import { useCustomer, useMarket, useRefresh } from "./market.model";
import * as css from "./market.css";

export const Market = () =>
  <div className={css.market}>
    <div className={css.marketBody}>
      <Content />
    </div>
  </div>

const Content = () => {
  const marketState = useMarket();
  const customerState = useCustomer(marketState.data);
  const refresh = useRefresh();

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
      customer={customerState.data}
    >
      <div className={css.customerStatsContainer}>
        <CustomerStats obligation={customerState.data?.obligation} />
        <RefreshButton
          refresh={refresh}
          isMarketFetching={marketState.isFetching}
          isCustomerFetching={customerState.isFetching}
        />
      </div>
      {customerState.data?.obligation &&
        <Obligation
          market={marketState.data}
          obligation={customerState.data!.obligation}
        />
      }
      <Reserves
        marketAddress={marketState.data.address}
        reserves={marketState.data.reservesActive}
        isEnabled={!!customerState.isFetched}
      />
    </ActionFormProvider>
  );
};
