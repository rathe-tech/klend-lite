import { KaminoReserve } from "@kamino-finance/klend-sdk";
import { UIPercent, UIUtils } from "@misc/utils";
import { ActionKind } from "../action-form";
import { StatInfo } from "../stat-info";
import { 
  computeProjectedBorrowAPY, 
  computeProjectedSupplyAPY, 
  computeProjectedUtilization,
} from "./stats-section.model";
import * as css from "./stats-section.css";

export const StatsSection = ({
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