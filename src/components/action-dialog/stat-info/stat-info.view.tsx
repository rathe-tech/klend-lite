import * as css from "./stat-info.css";

export const StatInfo = ({
  label,
  value,
}: {
  label: string,
  value: string,
}) =>
  <div className={css.root}>
    <div className={css.label}>{label}:</div>
    <div className={css.value}>{value}</div>
  </div>