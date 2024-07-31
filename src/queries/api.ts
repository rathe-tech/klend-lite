import Decimal from "decimal.js";
import {
  AddressLookupTableAccount,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
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
  const initialInstructions = prepareInitialInstructions(action, priorityFee);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units);
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
  const initialInstructions = prepareInitialInstructions(action, priorityFee);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units);
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
  const initialInstructions = prepareInitialInstructions(action, priorityFee);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units);
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
  const initialInstructions = prepareInitialInstructions(action, priorityFee);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units);
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return await sendAndConfirmTransaction(sendTransaction, connection, transaction);
}

function createPriorityFeeInstructions(priorityFee?: Decimal) {
  if (priorityFee == null || priorityFee.isZero()) {
    return [];
  }
  return [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee.toNumber() })];
}

function createModifyComputeUnitsInstructions(units: number | null) {
  if (units == null || units === 0) {
    return [];
  }
  return [ComputeBudgetProgram.setComputeUnitLimit({ units: Math.ceil(units * 1.05) })];
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

function prepareInitialInstructions(action: KaminoAction, priorityFee: Decimal | undefined) {
  return [
    ...createPriorityFeeInstructions(priorityFee),
    ...action.setupIxs,
    ...action.lendingIxs,
    ...action.cleanupIxs,
  ];
}

function patchInstructionsWithComputeUnits(
  instructions: TransactionInstruction[],
  units: number | null
) {
  return [
    ...createModifyComputeUnitsInstructions(units),
    ...instructions,
  ];
}

async function getExpectedComputeUnits(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTableAddress: PublicKey,
) {
  const { value: lookupTableAccount } = await connection.getAddressLookupTable(lookupTableAddress);
  if (lookupTableAccount == null) {
    throw new Error("Can't fetch lookup table account");
  }

  const probeInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 2_000_000 }),
    ...instructions,
  ];
  const probeTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: probeInstructions,
      payerKey: payer,
      recentBlockhash: PublicKey.default.toBase58(),
    }).compileToV0Message([lookupTableAccount])
  );

  const response = await connection.simulateTransaction(probeTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false
  });
  if (response.value.err) {
    console.error(JSON.stringify(response.value.err));
    throw new Error("Transaction simulation failed");
  }
  return response.value.unitsConsumed || null;
}