import Decimal from "decimal.js";
import { KaminoMarket, KaminoObligation, KaminoReserve } from "@kamino-finance/klend-sdk";
import { UIPercent, UIUtils } from "@misc/utils";
import { ActionKind } from "../action-form";
import { StatInfo } from "../stat-info";
import {
  computeProjectedBorrowAPY,
  computeProjectedLTV,
  computeProjectedSupplyAPY,
  computeProjectedUtilization,
} from "./stats-section.model";
import * as css from "./stats-section.css";
import { PublicKey } from "@solana/web3.js";

export const StatsSection = ({
  kind,
  market,
  reserve,
  obligation,
  inputAmount,
  mintAddress,
  slot,
}: {
  kind: ActionKind,
  market: KaminoMarket,
  reserve: KaminoReserve,
  obligation: KaminoObligation | undefined | null,
  inputAmount: Decimal | undefined,
  mintAddress: PublicKey,
  slot: number,
}) =>
  <div className={css.statsWrapper}>
    <StatInfo
      label="Price"
      value={UIUtils.toUIPrice(reserve.getOracleMarketPrice())}
    />
    <SupplyApyInfo
      kind={kind}
      reserve={reserve}
      inputAmount={inputAmount}
      slot={slot}
    />
    <BorrowApyInfo
      kind={kind}
      reserve={reserve}
      inputAmount={inputAmount}
      slot={slot}
    />
    {/* <LoanToValueInfo
      kind={kind}
      market={market}
      obligation={obligation}
      inputAmount={inputAmount}
      mintAddress={mintAddress}
    /> */}
    <UtilizationInfo
      kind={kind}
      reserve={reserve}
      inputAmount={inputAmount}
      slot={slot}
    />
    <BorrowFeeInfo
      kind={kind}
      reserve={reserve}
    />
  </div>

const SupplyApyInfo = ({
  kind,
  reserve,
  inputAmount,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: Decimal | undefined,
  slot: number,
}) => {
  if (ActionKind.isBorrowRelated(kind)) return;

  const currentSupplyApy = UIPercent.fromNumberFraction(reserve.stats.supplyInterestAPY);
  const projectedSupplyApy = computeProjectedSupplyAPY(kind, inputAmount, reserve, slot);
  const explanation = projectedSupplyApy == null ? currentSupplyApy : `${currentSupplyApy} → ${projectedSupplyApy}`;

  return <StatInfo label="Supply APY" value={explanation} />;
};

const BorrowApyInfo = ({
  kind,
  reserve,
  inputAmount,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: Decimal | undefined,
  slot: number,
}) => {
  if (ActionKind.isDepositRelated(kind)) return;

  const currentBorrowApy = UIPercent.fromNumberFraction(reserve.stats.borrowInterestAPY);
  const projectedBorrowApy = computeProjectedBorrowAPY(kind, inputAmount, reserve, slot);
  const explanation = projectedBorrowApy == null ? currentBorrowApy : `${currentBorrowApy} → ${projectedBorrowApy}`;

  return <StatInfo label="Borrow APY" value={explanation} />;
};

const LoanToValueInfo = ({
  kind,
  market,
  obligation,
  inputAmount,
  mintAddress,
}: {
  kind: ActionKind,
  market: KaminoMarket,
  obligation: KaminoObligation | undefined | null,
  inputAmount: Decimal | undefined,
  mintAddress: PublicKey,
}) => {
  const currentLtv =  obligation ? UIPercent.fromDecimalFraction(obligation.refreshedStats.loanToValue) : "0%";
  const projectedLtv = computeProjectedLTV(kind, inputAmount, market, mintAddress, obligation);
  const explanation = projectedLtv == null ? currentLtv : `${currentLtv} → ${projectedLtv}`;

  return <StatInfo label="Loan-to-Value" value={explanation} />
}

const UtilizationInfo = ({
  kind,
  reserve,
  inputAmount,
  slot,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  inputAmount: Decimal | undefined,
  slot: number
}) => {
  const currentUtilization = UIPercent.fromNumberFraction(reserve.calculateUtilizationRatio());
  const projectedUtilization = computeProjectedUtilization(kind, inputAmount, reserve, slot);
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