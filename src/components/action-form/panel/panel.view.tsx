// TODO: Cleanup the mess below

import { useCallback, useState } from "react";
import Decimal from "decimal.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { KaminoAction, KaminoMarket, KaminoObligation, PROGRAM_ID, Position, VanillaObligation, buildVersionedTransaction } from "@hubbleprotocol/kamino-lending-sdk";

import { useMarket } from "@components/market-context";
import { Assert, UIUtils } from "@misc/utils";
import { DONATION_ADDRESS } from "@misc/config";

import { ProgressIcon } from "../../progress-icon";
import { BalanceInfo } from "../balance-info";
import { ActionKind, useActionForm } from "../action-form.model";
import * as css from "./panel.css";

export function useAction({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) {
  const { market, obligation, tokenBalances } = useActionForm();
  Assert.some(market, "Market not loaded");
  Assert.some(tokenBalances, "Token balances not loaded");

  const reserve = market.getReserveByMint(mintAddress);
  Assert.some(reserve, "Reserve not loaded");

  const { address: reserveAddress, symbol, stats: { decimals } } = reserve;
  const balance = UIUtils.toUINumber(tokenBalances.get(mintAddress.toBase58()) || new Decimal(0), decimals);
  const positionAmount = UIUtils.toUINumber(extractPositionAmount({ kind, obligation, reserveAddress }), decimals);
  const position = extractPosition({ kind, obligation, reserveAddress });

  return { symbol, balance, positionAmount, decimals, position };
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
      throw new Error(`Not supported action: ${kind}`);
  }
}

export const Panel = ({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) => {
  const { symbol, balance, positionAmount, position, decimals } = useAction({ kind, mintAddress });

  return (
    <div className={css.panel}>
      <BalanceInfo symbol={symbol} amount={balance} suffix="in wallet" />
      <BalanceInfo symbol={symbol} amount={positionAmount} suffix={choosePositionName(kind)} />
      <div className={css.label}>{chooseLabel(kind, symbol)}</div>
      <SubmitForm kind={kind} decimals={decimals} mintAddress={mintAddress} position={position} />
    </div>
  );
};

type SendTransaction =
  (transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions
  ) => Promise<TransactionSignature>;

const SubmitForm = ({ kind, mintAddress, decimals, position }: { kind: ActionKind, mintAddress: PublicKey, decimals: number, position: Position | null | undefined }) => {
  const [value, setValue] = useState("0");
  const [inProgress, setInProgress] = useState(false);
  const { publicKey } = useWallet();
  const { marketInfo: { lutAddress }, refresh } = useMarket()
  const { market } = useActionForm();
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();

  const onSubmit = useCallback(async (value: string) => {
    try {
      setInProgress(true);
      const inputAmount = UIUtils.toNativeNumber(value.replaceAll(",", "").trim(), decimals);
      const canBeClosed = ActionKind.isClosePositionKind(kind);
      const amount = canBeClosed ? computeClosePositionAmount(inputAmount, position) : inputAmount;
      const txId = await processAction(sendTransaction, connection, market!, kind, publicKey!, mintAddress, amount, lutAddress);

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

const U64_MAX = new Decimal("18446744073709551615");
const EPS = new Decimal("1");

function computeClosePositionAmount(probeAmount: Decimal, position?: Position | null | undefined) {
  if (position == null) {
    return probeAmount;
  }

  const diff = position.amount.minus(probeAmount).abs();
  if (diff.lte(EPS)) {
    return U64_MAX;
  } else {
    return probeAmount;
  }
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

async function processAction(sendTransaction: SendTransaction, connection: Connection, market: KaminoMarket, kind: ActionKind, walletAddress: PublicKey, mintAddress: PublicKey, amount: Decimal, lutAddress: PublicKey): Promise<string> {
  switch (kind) {
    case ActionKind.Supply:
      return await supply(sendTransaction, connection, market, walletAddress, mintAddress, amount, lutAddress);
    case ActionKind.Borrow:
      return await borrow(sendTransaction, connection, market, walletAddress, mintAddress, amount, lutAddress);
    case ActionKind.Repay:
      return await repay(sendTransaction, connection, market, walletAddress, mintAddress, amount, lutAddress);
    case ActionKind.Withdraw:
      return await withdraw(sendTransaction, connection, market, walletAddress, mintAddress, amount, lutAddress);
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
}

const OBLIGATION_TYPE = new VanillaObligation(PROGRAM_ID);

async function supply(sendTransaction: SendTransaction, connection: Connection, market: KaminoMarket, walletAddress: PublicKey, mintAddress: PublicKey, amount: Decimal, lutAddress: PublicKey): Promise<string> {
  const action = await KaminoAction.buildDepositTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    OBLIGATION_TYPE,
    0,
    undefined,
    undefined,
    undefined,
    DONATION_ADDRESS
  );
  const instructions = [
    ...action.setupIxs,
    ...action.lendingIxs,
    ...action.cleanupIxs,
  ];
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return await sendAndConfirmTransaction(sendTransaction, connection, transaction);
}

async function borrow(sendTransaction: SendTransaction, connection: Connection, market: KaminoMarket, walletAddress: PublicKey, mintAddress: PublicKey, amount: Decimal, lutAddress: PublicKey): Promise<string> {
  const action = await KaminoAction.buildBorrowTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    OBLIGATION_TYPE,
    0,
    true,
    false,
    true,
    DONATION_ADDRESS,
  );
  const instructions = [
    ...action.setupIxs,
    ...action.lendingIxs,
    ...action.cleanupIxs,
  ];
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return await sendAndConfirmTransaction(sendTransaction, connection, transaction);
}

async function repay(sendTransaction: SendTransaction, connection: Connection, market: KaminoMarket, walletAddress: PublicKey, mintAddress: PublicKey, amount: Decimal, lutAddress: PublicKey): Promise<string> {
  const slot = await connection.getSlot();
  const action = await KaminoAction.buildRepayTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    OBLIGATION_TYPE,
    slot,
    undefined,
    0,
    true,
    undefined,
    undefined,
    DONATION_ADDRESS
  );
  const instructions = [
    ...action.setupIxs,
    ...action.lendingIxs,
    ...action.cleanupIxs,
  ];
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return await sendAndConfirmTransaction(sendTransaction, connection, transaction);
}

async function withdraw(sendTransaction: SendTransaction, connection: Connection, market: KaminoMarket, walletAddress: PublicKey, mintAddress: PublicKey, amount: Decimal, lutAddress: PublicKey): Promise<string> {
  const action = await KaminoAction.buildWithdrawTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    OBLIGATION_TYPE,
    0,
    true,
    undefined,
    undefined,
    DONATION_ADDRESS
  );
  const instructions = [
    ...action.setupIxs,
    ...action.lendingIxs,
    ...action.cleanupIxs,
  ];
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return await sendAndConfirmTransaction(sendTransaction, connection, transaction);
}

async function sendAndConfirmTransaction(sendTransaction: SendTransaction, connection: Connection, transaction: VersionedTransaction): Promise<string> {
  const transactionId = await sendTransaction(transaction, connection);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({ commitment: "finalized" });
  const status = await connection.confirmTransaction({
    signature: transactionId,
    blockhash,
    lastValidBlockHeight
  }, "confirmed");
  if (status.value.err) {
    throw new Error(status.value.err.toString());
  }
  return transactionId;
}