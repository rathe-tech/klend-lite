import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@kamino-finance/klend-sdk";

import { UIUtils, UIPercent } from "@misc/utils";

import { StatInfo } from "../stat-info";
import { Input } from "../input";
import { SubmitButton } from "../submit-button";
import { CustomerBalances } from "../customer-balances";

import {
  ActionKind,
  computeProjectedBorrowAPY,
  computeProjectedSupplyAPY,
  computeProjectedUtilization,
  useActionForm
} from "./action-form.model";
import * as css from "./action-form.css";

export const ActionForm = ({
  kind,
  mintAddress,
}: {
  kind: ActionKind,
  mintAddress: PublicKey,
}) => {
  const {
    slot, reserve, position, tokenBalances,
    inProgress, inputAmount, setInputAmount, onSubmit,
  } = useActionForm({ kind, mintAddress });

  return (
    <div className={css.form}>
      <Input
        value={inputAmount}
        decimals={reserve.stats.decimals}
        symbol={reserve.getTokenSymbol()}
        price={reserve.getOracleMarketPrice()}
        onChange={value => setInputAmount(value)}
      />
      <StatInfoSection
        kind={kind}
        reserve={reserve}
        inputAmount={inputAmount}
        decimals={reserve.stats.decimals}
        slot={slot}
      />
      <SubmitButton
        kind={kind}
        inProgress={inProgress}
        onSubmit={() => onSubmit(inputAmount)}
      />
      <CustomerBalances
        kind={kind}
        reserve={reserve}
        position={position}
        tokenBalances={tokenBalances}
        onWalletBalanceClick={v => setInputAmount(v)}
        onPositionBalanceClick={v => setInputAmount(v)}
      />
    </div>
  );
};

const StatInfoSection = ({
  kind,
  reserve,
  inputAmount,
  decimals,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: string,
  decimals: number,
  slot: number,
}) =>
  <div className={css.statsWrapper}>
    <StatInfo
      label="Price"
      value={UIUtils.toUIPrice(reserve.getOracleMarketPrice())}
    />
    <UtilizationInfo
      kind={kind}
      reserve={reserve}
      inputAmount={inputAmount}
      decimals={decimals}
      slot={slot}
    />
    <SupplyApyInfo
      kind={kind}
      reserve={reserve}
      inputAmount={inputAmount}
      decimals={decimals}
      slot={slot}
    />
    <BorrowApyInfo
      kind={kind}
      reserve={reserve}
      inputAmount={inputAmount}
      decimals={decimals}
      slot={slot}
    />
    <BorrowFeeInfo
      kind={kind}
      reserve={reserve}
    />
  </div>

const UtilizationInfo = ({
  kind,
  reserve,
  inputAmount,
  decimals,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: string,
  decimals: number,
  slot: number
}) => {
  const currentUtilization = UIPercent.fromNumberFraction(reserve.calculateUtilizationRatio());
  const projectedUtilization = computeProjectedUtilization(kind, inputAmount, decimals, reserve, slot);
  const explanation = projectedUtilization == null ? currentUtilization : `${currentUtilization} → ${projectedUtilization}`;

  return <StatInfo label="Utilization" value={explanation} />
};

const BorrowFeeInfo = ({
  kind,
  reserve,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
}) => {
  if (kind !== ActionKind.Borrow) return;

  const borrowFee = UIPercent.fromDecimalFraction(
    reserve.getBorrowFee(),
    reserve.getBorrowFee().dp() - 2
  );

  return <StatInfo label="Borrow fee" value={borrowFee} />
};

const SupplyApyInfo = ({
  kind,
  reserve,
  inputAmount,
  decimals,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: string,
  decimals: number,
  slot: number,
}) => {
  if (ActionKind.isBorrowRelated(kind)) return;

  const currentSupplyApy = UIPercent.fromNumberFraction(reserve.stats.supplyInterestAPY);
  const projectedSupplyApy = computeProjectedSupplyAPY(kind, inputAmount, decimals, reserve, slot);
  const explanation = projectedSupplyApy == null ? currentSupplyApy : `${currentSupplyApy} → ${projectedSupplyApy}`;

  return <StatInfo label="Supply APY" value={explanation} />;
};

const BorrowApyInfo = ({
  kind,
  reserve,
  inputAmount,
  decimals,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: string,
  decimals: number,
  slot: number,
}) => {
  if (ActionKind.isDepositRelated(kind)) return;

  const currentBorrowApy = UIPercent.fromNumberFraction(reserve.stats.borrowInterestAPY);
  const projectedBorrowApy = computeProjectedBorrowAPY(kind, inputAmount, decimals, reserve, slot);
  const explanation = projectedBorrowApy == null ? currentBorrowApy : `${currentBorrowApy} → ${projectedBorrowApy}`;

  return <StatInfo label="Borrow APY" value={explanation} />;
};