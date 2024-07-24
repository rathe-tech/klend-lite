import Decimal from "decimal.js";
import {
  Commitment,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
  KaminoMarket,
  KaminoAction,
  VanillaObligation,
  buildVersionedTransaction,
  PROGRAM_ID,
} from "@kamino-finance/klend-sdk";
import { DONATION_ADDRESS } from "@misc/config";

export interface ActionParams {
  sendTransaction: SendTransaction;
  connection: Connection;
  market: KaminoMarket;
  mintAddress: PublicKey;
  amount: Decimal;
  walletAddress: PublicKey;
  lutAddress: PublicKey;
  priorityFee?: Decimal;
}

export async function supply({
  sendTransaction,
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
  priorityFee,
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
    undefined,
  );
  const instructions = [
    ...createPriorityFeeInstructions(priorityFee),
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
  lutAddress,
  priorityFee,
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
    undefined,
  );
  const instructions = [
    ...createPriorityFeeInstructions(priorityFee),
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
  priorityFee,
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
    undefined,
  );
  const instructions = [
    ...createPriorityFeeInstructions(priorityFee),
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
  priorityFee,
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
    undefined,
  );
  const instructions = [
    ...createPriorityFeeInstructions(priorityFee),
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

function createPriorityFeeInstructions(priorityFee?: Decimal) {
  if (priorityFee == null) {
    return [];
  }
  return [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee.toNumber() })];
}

async function sendAndConfirmTransaction(
  sendTransaction: SendTransaction,
  connection: Connection,
  transaction: VersionedTransaction,
): Promise<string> {
  const commitment: Commitment = "confirmed";
  const { context: { slot: minContextSlot }, value: { blockhash, lastValidBlockHeight } } =
    await connection.getLatestBlockhashAndContext({ commitment });

  const transactionId = await sendTransaction(transaction, connection, { minContextSlot });
  const status = await connection.confirmTransaction({
    signature: transactionId,
    minContextSlot,
    blockhash,
    lastValidBlockHeight,
  }, commitment);

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