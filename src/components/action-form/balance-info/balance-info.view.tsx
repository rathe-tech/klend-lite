import * as css from "./balance-info.css";

export const BalanceInfo = ({
  symbol,
  amount,
  suffix = "balance"
}: {
  symbol: string,
  amount: string,
  suffix: string,
}) =>
  <div className={css.root}>
    <div className={css.title}>{symbol} {suffix}:</div>
    <div className={css.value}>{amount}</div>
  </div>