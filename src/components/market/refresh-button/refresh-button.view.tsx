import { useMarket } from "@components/market-context";
import { ProgressIcon } from "../../progress-icon";
import * as css from "./refresh-button.css";

export const RefreshButton = () => {
  const { marketState, obligationState, tokenBalancesState, refresh } = useMarket();
  const isMarketFetching = marketState.isFetching;
  const isObligationFetching = obligationState.isFetching;
  const isTokenBalancesFetching = tokenBalancesState.isFetching;
  const isInProgress = isMarketFetching || isObligationFetching || isTokenBalancesFetching;

  return (
    <button
      className={css.refreshButton}
      disabled={isInProgress}
      onClick={() => refresh()}
    >
      {isInProgress && <ProgressIcon />}
      {humanizeProgressState({ isMarketFetching, isObligationFetching, isTokenBalancesFetching })}
    </button>
  );
}

function humanizeProgressState({
  isMarketFetching,
  isObligationFetching,
  isTokenBalancesFetching,
}: {
  isMarketFetching: boolean,
  isObligationFetching: boolean,
  isTokenBalancesFetching: boolean,
}) {
  if (isMarketFetching) return "Fetching market...";
  if (isObligationFetching) return "Fetching account...";
  if (isTokenBalancesFetching) return "Fetching wallet...";
  else return "Refresh";
}