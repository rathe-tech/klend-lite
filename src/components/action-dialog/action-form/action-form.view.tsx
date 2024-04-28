import { useCallback, useState } from "react";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { KaminoObligation, Position } from "@hubbleprotocol/kamino-lending-sdk";

import { borrow, repay, supply, withdraw, ActionParams } from "@queries/api";
import { useMarket } from "@components/market-context";
import { Assert, UIUtils } from "@misc/utils";

import { ProgressIcon } from "../../progress-icon";
import { StatInfo } from "../stat-info";

import { ActionKind, computeSubmittedAmount } from "./action-form.model";
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
  const balance = UIUtils.toUINumber(tokenBalances.get(mintAddress.toBase58()) || new Decimal(0), decimals);
  const positionAmount = UIUtils.toUINumber(extractPositionAmount({ kind, obligation, reserveAddress }), decimals);
  const position = extractPosition({ kind, obligation, reserveAddress });
  const borrowFee = UIUtils.toFormattedPercent(reserve.getBorrowFee(), Math.max(0, reserve.getBorrowFee().dp() - 2));

  return { symbol, balance, positionAmount, decimals, position, borrowFee };
}

function extractPositionAmount({
  kind,
  obligation,
  reserveAddress,
}: {
  kind: ActionKind,
  obligation: KaminoObligation | null | undefined,
  reserveAddress: PublicKey,
}) {
  if (obligation == null) {
    return new Decimal(0);
  }

  switch (kind) {
    case ActionKind.Supply:
    case ActionKind.Withdraw:
      return obligation.deposits.get(reserveAddress)?.amount || new Decimal(0);
    case ActionKind.Borrow:
    case ActionKind.Repay:
      return obligation.borrows.get(reserveAddress)?.amount || new Decimal(0);
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
}

function extractPosition({
  kind,
  obligation,
  reserveAddress,
}: {
  kind: ActionKind,
  obligation: KaminoObligation | null | undefined,
  reserveAddress: PublicKey,
}) {
  if (obligation == null) {
    return;
  }

  switch (kind) {
    case ActionKind.Supply:
    case ActionKind.Withdraw:
      return obligation.deposits.get(reserveAddress);
    case ActionKind.Borrow:
    case ActionKind.Repay:
      return obligation.borrows.get(reserveAddress);
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
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
  const { symbol, balance, positionAmount, position, decimals, borrowFee } = useAction({ kind, mintAddress });

  return (
    <div className={css.form}>
      <StatInfo label={`${symbol} in wallet`} value={balance} />
      <StatInfo label={`${symbol} ${choosePositionName(kind)}`} value={positionAmount} />
      {kind === ActionKind.Borrow && <StatInfo label="Borrow fee" value={borrowFee} />}
      <div className={css.label}>{chooseLabel(kind, symbol)}</div>
      <SubmitForm kind={kind} decimals={decimals} mintAddress={mintAddress} position={position} />
    </div>
  );
};

const SubmitForm = ({
  kind,
  mintAddress,
  decimals,
  position
}: {
  kind: ActionKind,
  mintAddress: PublicKey,
  decimals: number,
  position: Position | null | undefined
}) => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const {
    marketInfo: { lutAddress },
    marketState: { data: market },
    refresh
  } = useMarket();

  const [value, setValue] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const onSubmit = useCallback(async (value: string) => {
    try {
      setInProgress(true);
      const inputAmount = UIUtils.toNativeNumber(value.replaceAll(",", "").trim(), decimals);
      const amount = computeSubmittedAmount(kind, inputAmount, position);
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
        onChange={e => setValue(e.target.value)}
      />
      <button
        disabled={inProgress}
        className={css.submit}
        onClick={() => onSubmit(value)}
      >
        {inProgress && <ProgressIcon />}
        {chooseButtonCaption(kind, inProgress)}
      </button>
    </>
  );
}

function chooseButtonCaption(kind: ActionKind, inProgress: boolean) {
  if (inProgress) {
    return "Processing...";
  }

  switch (kind) {
    case ActionKind.Borrow:
      return "Borrow";
    case ActionKind.Repay:
      return "Repay";
    case ActionKind.Supply:
      return "Supply";
    case ActionKind.Withdraw:
      return "Withdraw";
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
}

async function processAction(kind: ActionKind, params: ActionParams): Promise<string> {
  switch (kind) {
    case ActionKind.Supply:
      return await supply(params);
    case ActionKind.Borrow:
      return await borrow(params);
    case ActionKind.Repay:
      return await repay(params);
    case ActionKind.Withdraw:
      return await withdraw(params);
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
}