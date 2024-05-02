import { useCallback, useState } from "react";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useMarket } from "@components/market-context";
import { Assert, UIUtils } from "@misc/utils";

import { StatInfo } from "../stat-info";
import { SubmitButton } from "../submit-button";
import { CustomerBalances } from "../customer-balances";

import { ActionKind, computeSubmittedAmount, extractPosition, processAction } from "./action-form.model";
import * as css from "./action-form.css";
import { KaminoReserve, Position } from "@kamino-finance/klend-sdk";

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

  const { address: reserveAddress } = reserve;
  const position = extractPosition(kind, obligation, reserveAddress);

  return { reserve, position, tokenBalances };
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
  const { reserve, position, tokenBalances } = useAction({ kind, mintAddress });

  return (
    <div className={css.form}>
      <BorrowFeeStatInfo kind={kind} reserve={reserve} />
      <div className={css.label}>{chooseLabel(kind, reserve.getTokenSymbol())}</div>
      <SubmitForm kind={kind} reserve={reserve} position={position} tokenBalances={tokenBalances} />
    </div>
  );
};

const BorrowFeeStatInfo = ({
  kind,
  reserve,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
}) => {
  if (kind !== ActionKind.Borrow) return;

  const borrowFee = UIUtils.toFormattedPercent(
    reserve.getBorrowFee(),
    Math.max(0, reserve.getBorrowFee().dp() - 2)
  );
  return <StatInfo label="Borrow fee" value={borrowFee} />
};

const SubmitForm = ({
  kind,
  reserve,
  position,
  tokenBalances,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
  position: Position | null | undefined,
  tokenBalances: Map<string, Decimal>,
}) => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const {
    marketInfo: { lutAddress },
    marketState: { data: market },
    refresh,
  } = useMarket();

  const positionAmount = position?.amount ?? new Decimal(0);
  const { stats: { decimals, mintAddress } } = reserve;

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
      <CustomerBalances
        kind={kind}
        reserve={reserve}
        position={position}
        tokenBalances={tokenBalances}
        onWalletBalanceClick={v => setValue(v)}
        onPositionBalanceClick={v => setValue(v)}
      />
    </>
  );
}