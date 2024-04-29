import { useCallback, useState } from "react";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useMarket } from "@components/market-context";
import { Assert, UIUtils } from "@misc/utils";

import { StatInfo } from "../stat-info";
import { SubmitButton } from "../submit-button";

import { ActionKind, computeSubmittedAmount, extractPosition, processAction } from "./action-form.model";
import * as css from "./action-form.css";

export function useAction({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) {
  const {
    marketState: { data: market },
    tokenBalancesState: { data: tokenBalances },
    obligationState: { data: obligation },
  } = useMarket();

  Assert.some(market, "Market not loaded");
  Assert.some(tokenBalances, "Token balances not loaded");

  const reserve = market.getReserveByMint(mintAddress);
  Assert.some(reserve, "Reserve not loaded");

  const { address: reserveAddress, symbol, stats: { decimals } } = reserve;
  const walletAmount = UIUtils.toUINumber(tokenBalances.get(mintAddress.toBase58()) || new Decimal(0), decimals);
  const position = extractPosition(kind, obligation, reserveAddress);
  const positionAmount = position?.amount ?? new Decimal(0);
  const borrowFee = UIUtils.toFormattedPercent(reserve.getBorrowFee(), Math.max(0, reserve.getBorrowFee().dp() - 2));

  return { symbol, decimals, walletAmount, positionAmount, borrowFee };
}

export function choosePositionName(kind: ActionKind) {
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

export function chooseLabel(kind: ActionKind, symbol: string) {
  switch (kind) {
    case ActionKind.Borrow:
      return `Amount of ${symbol} to borrow:`;
    case ActionKind.Supply:
      return `Amount of ${symbol} to supply:`;
    case ActionKind.Repay:
      return `Amount of ${symbol} to repay:`;
    case ActionKind.Withdraw:
      return `Amount of ${symbol} to withdraw:`;
    default:
      throw new Error(`Unsupported action: ${kind}`);
  }
}

export const ActionForm = ({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) => {
  const { symbol, walletAmount, positionAmount, decimals, borrowFee } = useAction({ kind, mintAddress });

  return (
    <div className={css.form}>
      <StatInfo label={`${symbol} in wallet`} value={walletAmount} />
      <StatInfo label={`${symbol} ${choosePositionName(kind)}`} value={UIUtils.toUINumber(positionAmount, decimals)} />
      {kind === ActionKind.Borrow && <StatInfo label="Borrow fee" value={borrowFee} />}
      <div className={css.label}>{chooseLabel(kind, symbol)}</div>
      <SubmitForm kind={kind} decimals={decimals} mintAddress={mintAddress} positionAmount={positionAmount} />
    </div>
  );
};

const SubmitForm = ({
  kind,
  mintAddress,
  decimals,
  positionAmount
}: {
  kind: ActionKind,
  mintAddress: PublicKey,
  decimals: number,
  positionAmount: Decimal | null | undefined
}) => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const {
    marketInfo: { lutAddress },
    marketState: { data: market },
    refresh,
  } = useMarket();

  const [value, setValue] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const onSubmit = useCallback(async (value: string) => {
    try {
      setInProgress(true);
      const inputAmount = UIUtils.toNativeNumber(value.replaceAll(",", "").trim(), decimals);
      const amount = computeSubmittedAmount(kind, inputAmount, positionAmount);
      const txId = await processAction(kind, { sendTransaction, connection, market: market!, walletAddress: publicKey!, mintAddress, amount, lutAddress });

      alert(`Transaction complete: ${txId}`);
      await refresh();
    } catch (e: any) {
      alert(e.toString());
      console.log(e);
    } finally {
      setInProgress(false);
    }
  }, [kind, mintAddress]);

  return (
    <>
      <input
        autoFocus
        className={css.input}
        value={value}
        placeholder="0"
        onChange={e => setValue(e.target.value)}
      />
      <SubmitButton
        kind={kind}
        inProgress={inProgress}
        onSubmit={() => onSubmit(value)}
      />
    </>
  );
}