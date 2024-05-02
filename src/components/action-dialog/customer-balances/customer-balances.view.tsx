import Decimal from "decimal.js";
import { KaminoReserve, Position } from "@kamino-finance/klend-sdk";

import { UIUtils } from "@misc/utils";
import { ActionKind } from "../action-dialog.model";
import * as css from "./customer-balances.css";

export const CustomerBalances = ({
  kind,
  reserve,
  position,
  tokenBalances,
  onWalletBalanceClick,
  onPositionBalanceClick,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  position: Position | null | undefined,
  tokenBalances: Map<string, Decimal>,
  onWalletBalanceClick: (value: string) => void,
  onPositionBalanceClick: (value: string) => void,
}) =>
  <div className={css.root}>
    <WalletBalance
      tokenBalances={tokenBalances}
      reserve={reserve}
      onBalanceClick={onWalletBalanceClick}
    />
    <PositionBalance
      kind={kind}
      position={position}
      reserve={reserve}
      onBalanceClick={onPositionBalanceClick}
    />
  </div>

const WalletBalance = ({
  reserve,
  tokenBalances,
  onBalanceClick,
}: {
  reserve: KaminoReserve,
  tokenBalances: Map<string, Decimal>,
  onBalanceClick: (value: string) => void,
}) => {
  const { stats: { symbol, decimals, mintAddress } } = reserve;
  const balance = UIUtils.toUINumber(tokenBalances.get(mintAddress.toBase58()) ?? new Decimal(0), decimals, true);

  return (
    <div className={css.item}>
      <span 
        className={css.prefix} 
        onClick={() => onBalanceClick(balance.replaceAll(",", ""))}
      >
        {balance}
      </span>
      <span className={css.suffix}>{symbol}</span>
      <span className={css.suffix}>in wallet</span>
    </div>
  );
};

const PositionBalance = ({
  kind,
  reserve,
  position,
  onBalanceClick,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  position: Position | null | undefined,
  onBalanceClick: (value: string) => void,
}) => {
  const { stats: { symbol, decimals } } = reserve;
  const balance = UIUtils.toUINumber(position?.amount ?? new Decimal(0), decimals, true);

  return (
    <div className={css.item}>
      <span 
        className={css.prefix} 
        onClick={() => onBalanceClick(balance.replaceAll(",", ""))}
      >
        {balance}
      </span>
      <span className={css.suffix}>{symbol}</span>
      <span className={css.suffix}>{choosePositionName(kind)}</span>
    </div>
  );
};

function choosePositionName(kind: ActionKind) {
  switch (kind) {
    case ActionKind.Supply:
    case ActionKind.Withdraw:
      return "supplied";
    case ActionKind.Borrow:
    case ActionKind.Repay:
      return "borrowed";
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
}