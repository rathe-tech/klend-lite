import { useMarket } from "@components/market-context";
import { ReservesTable, SkeletonReservesTable } from "./reserves-table";
import * as css from "./reserves.css";

export const Reserves = () => {
  const { marketState, obligationState, tokenBalancesState } = useMarket();

  if (marketState.isPending) {
    return (
      <div className={css.reserves}>
        <SkeletonReservesTable />
      </div>
    );
  }

  if (marketState.data == null) {
    return <div>No data found</div>;
  }

  return (
    <div className={css.reserves}>
      <ReservesTable
        marketAddress={marketState.data.address}
        reserves={marketState.data.reservesActive}
        isEnabled={obligationState.isFetched && tokenBalancesState.isFetched}
      />
    </div>
  );
};