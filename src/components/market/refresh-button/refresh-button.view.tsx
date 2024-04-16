import { ProgressIcon } from "../../progress-icon";
import * as css from "./refresh-button.css";

export const RefreshButton = ({
  refresh,
  isMarketFetching,
  isCustomerFetching,
}: {
  refresh: () => void,
  isMarketFetching: boolean,
  isCustomerFetching: boolean,
}) => {
  return (
    <button
      className={css.refreshButton}
      disabled={isMarketFetching || isCustomerFetching}
      onClick={() => refresh()}
    >
      {(isMarketFetching || isCustomerFetching) && <ProgressIcon />}
      {humanizeProgressState({ isMarketFetching, isCustomerFetching })}
    </button>
  );
}

function humanizeProgressState({ 
  isMarketFetching, 
  isCustomerFetching,
}: { 
  isMarketFetching: boolean,
  isCustomerFetching: boolean,
}) {
  if (isMarketFetching) return "Refreshing market...";
  if (isCustomerFetching) return "Refreshing customer...";
  else return "Refresh";
}