import { Reserves } from "../reserves";
import { Obligation } from "../obligation";
import { ActionFormProvider } from "../action-form";

import { CustomerStats } from "./customer-stats";
import { RefreshButton } from "./refresh-button";

import { 
  useMarket, 
  useObligation, 
  useTokenBalances, 
  useRefresh 
} from "./market.model";
import * as css from "./market.css";

export const Market = () =>
  <div className={css.market}>
    <div className={css.marketBody}>
      <Content />
    </div>
  </div>

const Content = () => {
  const marketState = useMarket();
  const obligationState = useObligation(marketState.data);
  const tokenBalances = useTokenBalances(marketState.data);

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
      obligation={obligationState.data}
      tokenBalances={tokenBalances.data}
    >
      <div className={css.customerStatsContainer}>
        <CustomerStats obligation={obligationState.data} />
        <RefreshButton
          refresh={refresh}
          isMarketFetching={marketState.isFetching}
          isCustomerFetching={obligationState.isFetching || tokenBalances.isFetching}
        />
      </div>
      {obligationState.data &&
        <Obligation
          market={marketState.data}
          obligation={obligationState.data}
        />
      }
      <Reserves
        marketAddress={marketState.data.address}
        reserves={marketState.data.reservesActive}
        isEnabled={obligationState.isFetched && tokenBalances.isFetched}
      />
    </ActionFormProvider>
  );
};
