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
      {(isMarketFetching || isCustomerFetching) && <Circle />}
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

export const Circle = () =>
  <div className={css.circle} />