import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoObligation, KaminoReserve } from "@kamino-finance/klend-sdk";

import { UIPercent, UIUtils } from "@misc/utils";
import { ActionKind } from "../action-form";
import { StatInfo } from "../stat-info";

import { useStats } from "./stats-section.model";
import * as css from "./stats-section.css";

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
}) => {
  const { supplyAPY, borrowAPY, utilization, ltv } = useStats(
    kind,
    inputAmount,
    mintAddress,
    market,
    obligation,
    reserve,
    slot);

  return (
    <div className={css.statsWrapper}>
      <StatInfo
        label="Price"
        value={UIUtils.toUIPrice(reserve.getOracleMarketPrice())}
      />
      <SupplyApyInfo
        kind={kind}
        explanation={supplyAPY.explanation}
      />
      <BorrowApyInfo
        kind={kind}
        explanation={borrowAPY.explanation}
      />
      <StatInfo
        label="Utilization"
        value={utilization.explained}
      />
      <StatInfo
        label="Loan-to-Value"
        value={ltv.explained}
      />
      <BorrowFeeInfo
        kind={kind}
        reserve={reserve}
      />
    </div>
  );
};

const SupplyApyInfo = ({ kind, explanation }: { kind: ActionKind, explanation: string }) => {
  if (ActionKind.isBorrowRelated(kind)) return;
  return <StatInfo label="Supply APY" value={explanation} />;
};

const BorrowApyInfo = ({ kind, explanation }: { kind: ActionKind, explanation: string }) => {
  if (ActionKind.isDepositRelated(kind)) return;
  return <StatInfo label="Borrow APY" value={explanation} />;
};

const BorrowFeeInfo = ({ kind, reserve }: { kind: ActionKind, reserve: KaminoReserve }) => {
  if (kind !== ActionKind.Borrow) return;

  const borrowFee = UIPercent.fromDecimalFraction(
    reserve.getBorrowFee(),
    reserve.getBorrowFee().dp() - 2
  );

  return <StatInfo label="Borrow fee" value={borrowFee} />;
};