import Decimal from "decimal.js";
import {
  Commitment,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  KaminoMarket,
  KaminoAction,
  VanillaObligation,
  buildVersionedTransaction,
  PROGRAM_ID,
} from "@kamino-finance/klend-sdk";
import { DONATION_ADDRESS, ZERO } from "@misc/config";
import {
  GetBundleStatusesRequest,
  GetInflightBundleStatusesRequest,
  JitBlockEngineClient,
  JsonRpcResponse,
  SendBundleRequest,
  TipAddresses,
} from "@rathe/jito-block-engine-api";

export interface ActionParams {
  signTransaction: <T extends Transaction | VersionedTransaction>(transactions: T) => Promise<T>,
  connection: Connection;
  market: KaminoMarket;
  mintAddress: PublicKey;
  amount: Decimal;
  walletAddress: PublicKey;
  lutAddress: PublicKey;
  priorityFee: Decimal;
  jitoMode: boolean;
  jitoClient: JitBlockEngineClient,
}

export async function supply({
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
  priorityFee,
  jitoMode,
  signTransaction,
  jitoClient,
}: ActionParams): Promise<string> {
  const action = await KaminoAction.buildDepositTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
    false,
    undefined,
    0,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const initialInstructions = prepareInitialInstructions(action);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units, jitoMode ? ZERO : priorityFee);
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return jitoMode ?
    await sendAndConfirmWithJito(connection, transaction, priorityFee, walletAddress, signTransaction, jitoClient) :
    await sendAndConfirmTransaction(connection, signTransaction, transaction);
}

export async function borrow({
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
  priorityFee,
  jitoMode,
  jitoClient,
  signTransaction,
}: ActionParams): Promise<string> {
  const action = await KaminoAction.buildBorrowTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
    false,
    undefined,
    0,
    true,
    false,
    undefined,
    undefined,
  );
  const initialInstructions = prepareInitialInstructions(action);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units, jitoMode ? ZERO : priorityFee);
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return jitoMode ?
    await sendAndConfirmWithJito(connection, transaction, priorityFee, walletAddress, signTransaction, jitoClient) :
    await sendAndConfirmTransaction(connection, signTransaction, transaction);
}

export async function repay({
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
  priorityFee,
  jitoMode,
  jitoClient,
  signTransaction,
}: ActionParams): Promise<string> {
  const slot = await connection.getSlot();
  const action = await KaminoAction.buildRepayTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
    false,
    undefined,
    slot,
    undefined,
    0,
    true,
    undefined,
    undefined,
    undefined,
  );
  const initialInstructions = prepareInitialInstructions(action);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units, jitoMode ? ZERO : priorityFee);
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return jitoMode ?
    await sendAndConfirmWithJito(connection, transaction, priorityFee, walletAddress, signTransaction, jitoClient) :
    await sendAndConfirmTransaction(connection, signTransaction, transaction);
}

export async function withdraw({
  connection,
  market,
  mintAddress,
  amount,
  walletAddress,
  lutAddress,
  priorityFee,
  jitoMode,
  jitoClient,
  signTransaction,
}: ActionParams): Promise<string> {
  const action = await KaminoAction.buildWithdrawTxns(
    market,
    amount.toString(),
    mintAddress,
    walletAddress,
    new VanillaObligation(PROGRAM_ID),
    false,
    undefined,
    0,
    true,
    undefined,
    undefined,
    undefined,
  );
  const initialInstructions = prepareInitialInstructions(action);
  const units = await getExpectedComputeUnits(connection, initialInstructions, walletAddress, lutAddress);
  const instructions = patchInstructionsWithComputeUnits(initialInstructions, units, jitoMode ? ZERO : priorityFee);
  const transaction = await buildVersionedTransaction(
    connection,
    walletAddress,
    instructions,
    [lutAddress]
  );
  return jitoMode ?
    await sendAndConfirmWithJito(connection, transaction, priorityFee, walletAddress, signTransaction, jitoClient) :
    await sendAndConfirmTransaction(connection, signTransaction, transaction);
}

function createPriorityFeeInstructions(units: number, priorityFee: Decimal) {
  const price = BigInt(priorityFee.mul(10 ** 6).div(units).floor().toString());
  return [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: price })];
}

function createModifyComputeUnitsInstructions(units: number | null) {
  if (units == null || units === 0) {
    return [];
  }
  return [ComputeBudgetProgram.setComputeUnitLimit({ units })];
}

async function sendAndConfirmTransaction(
  connection: Connection,
  signTransaction: <T extends Transaction | VersionedTransaction>(transactions: T) => Promise<T>,
  transaction: VersionedTransaction,
): Promise<string> {
  const commitment: Commitment = "confirmed";
  const { context: { slot: minContextSlot }, value: { blockhash, lastValidBlockHeight } } =
    await connection.getLatestBlockhashAndContext({ commitment });

  const signedTransaction = await signTransaction(transaction);
  const transactionId = await connection.sendRawTransaction(signedTransaction.serialize(), { minContextSlot });
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

async function sendAndConfirmWithJito(
  connection: Connection,
  transaction: VersionedTransaction,
  priorityFee: Decimal,
  wallet: PublicKey,
  signTransaction: <T extends Transaction | VersionedTransaction>(transactions: T) => Promise<T>,
  jitoClient: JitBlockEngineClient,
) {
  const commitment: Commitment = "confirmed";
  const { value: { blockhash } } =
    await connection.getLatestBlockhashAndContext({ commitment });
  const tipTransaction = createJitoTipTransaction({
    payer: wallet!,
    lamports: priorityFee.toNumber(),
    recentBlockhash: blockhash,
  });
  const transactions = await Promise.all([
    signTransaction(transaction),
    signTransaction(tipTransaction),
  ]);
  const sendBundleRequest = SendBundleRequest.fromVersionedTransactions(transactions);
  const sendBundleResponse = await jitoClient.sendBundle(sendBundleRequest);
  const bundleId = JsonRpcResponse.tryGetResult(sendBundleResponse);
  return await pollJitoBundleStatus(bundleId, jitoClient, commitment);
}

function prepareInitialInstructions(action: KaminoAction) {
  return [
    ...action.setupIxs,
    ...action.lendingIxs,
    ...action.cleanupIxs,
  ];
}

function patchInstructionsWithComputeUnits(
  instructions: TransactionInstruction[],
  units: number,
  priorityFee: Decimal,
) {
  return [
    ...createModifyComputeUnitsInstructions(units),
    ...createPriorityFeeInstructions(units, priorityFee),
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
  const units = response.value.unitsConsumed;
  return units != null ? Math.ceil(units * 1.05) : 1_400_000;
}

function createJitoTipTransaction({
  payer,
  tipAddress,
  lamports,
  recentBlockhash,
}: {
  payer: PublicKey,
  tipAddress?: PublicKey,
  lamports: number,
  recentBlockhash: string,
}) {
  const instructions = [
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 0 }),
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: tipAddress ?? TipAddresses.random(),
      lamports,
    }),
  ];
  return new VersionedTransaction(
    new TransactionMessage({
      instructions,
      payerKey: payer,
      recentBlockhash,
    }).compileToV0Message()
  );
}

async function pollJitoBundleStatus(
  bundleId: string,
  jitoClient: JitBlockEngineClient,
  commitment: Commitment,
  timeout: number = 60_000,
  delay: number = 1_000,
) {
  const inflightStatusRequest = GetInflightBundleStatusesRequest.create([bundleId]);
  const detailedStatusRequest = GetBundleStatusesRequest.create([bundleId]);

  const start = Date.now();
  while (Date.now() - start < timeout) {
    const inflightStatusResponse = await jitoClient.getInflightBundleStatuses(inflightStatusRequest);
    const inflightResult = JsonRpcResponse.tryGetResult(inflightStatusResponse);

    if (inflightResult.value != null && inflightResult.value[0] != null) {
      const inflightBundle = inflightResult.value[0];
      if (inflightBundle.status === "Failed") {
        throw new Error("Failed to land transaction via Jito");
      }
      if (inflightBundle.status === "Landed") {
        const detailedResponse = await jitoClient.getBundleStatuses(detailedStatusRequest);
        const detailedResult = JsonRpcResponse.tryGetResult(detailedResponse);

        if (detailedResult.value.length === 1 && detailedResult.value[0] != null) {
          const { value: [{ confirmation_status, transactions, error: nestedError }] } = detailedResult;
          if (nestedError) {
            console.error(nestedError);
            throw new Error(JSON.stringify(nestedError));
          }
          if (confirmation_status === "finalized" || confirmation_status === commitment) {
            return transactions[0];
          }
        }
      }
    }
    await sleep(delay);
  }

  throw new Error("Transaction not confirmed");
}

async function sleep(ms: number) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}