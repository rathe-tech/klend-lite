import Decimal from "decimal.js";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
  KaminoMarket,
  KaminoAction,
  VanillaObligation, buildVersionedTransaction,
  PROGRAM_ID,
} from "@hubbleprotocol/kamino-lending-sdk";
import { DONATION_ADDRESS } from "@misc/config";

export interface ActionParams {
  sendTransaction: SendTransaction;
  connection: Connection;
  market: KaminoMarket;
  mintAddress: PublicKey;
  amount: Decimal;
  walletAddress: PublicKey;
  lutAddress: PublicKey;
}

export async function supply({
  sendTransaction,
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
}: ActionParams): Promise<string> {
  const action = await KaminoAction.buildDepositTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
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

export async function borrow({
  sendTransaction,
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress
}: ActionParams): Promise<string> {
  const action = await KaminoAction.buildBorrowTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
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

export async function repay({
  sendTransaction,
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
}: ActionParams): Promise<string> {
  const slot = await connection.getSlot();
  const action = await KaminoAction.buildRepayTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
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

export async function withdraw({
  sendTransaction,
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
}: ActionParams): Promise<string> {
  const action = await KaminoAction.buildWithdrawTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
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

async function sendAndConfirmTransaction(
  sendTransaction: SendTransaction,
  connection: Connection,
  transaction: VersionedTransaction,
): Promise<string> {
  const transactionId = await sendTransaction(transaction, connection);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({ commitment: "finalized" });

  // TODO: Find a better way to confirm tx.
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

type SendTransaction =
  (transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions
  ) => Promise<TransactionSignature>;