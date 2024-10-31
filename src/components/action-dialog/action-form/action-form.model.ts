import Decimal from "decimal.js";
import { useCallback, useMemo, useState } from "react";

import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { KaminoObligation, U64_MAX } from "@kamino-finance/klend-sdk";

import { ZERO } from "@misc/config";
import { Assert, Simulation, TokenAmount } from "@misc/utils";
import { ActionParams, borrow, repay, supply, withdraw } from "@queries/api";
import { useNotifications, NotificationKind } from "@components/notifications";
import { useMarket } from "@components/market-context";
import { useSettings } from "@components/settings-context";
import { useJitoClient } from "@components/jito-client-context";

import { ActionKind } from "../action-dialog.model";
export { ActionKind };

export function useActionForm({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) {
  const { connection } = useConnection();
  const { sendTransaction, signAllTransactions, publicKey } = useWallet();
  const { notify } = useNotifications();
  const jitoClient = useJitoClient();

  Assert.some(publicKey, "Wallet not connected");
  Assert.some(signAllTransactions, "Wallet not connected");

  const { priorityFee, jitoMode } = useSettings();

  const {
    marketInfo: { lutAddress },
    slotState: { data: slot },
    marketState: { data: market },
    tokenBalancesState: { data: tokenBalances },
    obligationState: { data: obligation },
    refresh,
  } = useMarket();

  Assert.some(slot, "Slot not loaded");
  Assert.some(market, "Market not loaded");
  Assert.some(tokenBalances, "Token balances not loaded");

  const reserve = market.getReserveByMint(mintAddress);
  Assert.some(reserve, "Reserve not loaded");

  const { address: reserveAddress, stats: { decimals } } = reserve;

  const inputAmount = useInputAmount(decimals);
  const [inProgress, setInProgress] = useState(false);

  const position = extractPosition(kind, obligation, reserveAddress);
  const positionAmount = position?.amount ?? ZERO;

  const onSubmit = useCallback(async (inputAmount: Decimal | undefined) => {
    const id = crypto.randomUUID();
    try {
      setInProgress(true);
      notify({ id, kind: NotificationKind.Info, message: "In progress..." });
      Assert.some(inputAmount, "Invalid input amount");
      const amount = computeSubmittedAmount(kind, inputAmount, positionAmount);
      const sig = await processAction(kind, {
        sendTransaction,
        connection,
        market,
        walletAddress: publicKey,
        mintAddress,
        amount,
        lutAddress,
        priorityFee,
        jitoMode,
        jitoClient,
        signAllTransactions,
      });
      await refresh();
      notify({ id, kind: NotificationKind.Success, message: `Transaction complete: ${sig}`, closable: true });
    } catch (e: any) {
      notify({ id, kind: NotificationKind.Error, message: e.toString(), closable: true });
      console.error(e);
    } finally {
      setInProgress(false);
    }
  }, [kind, connection, market, mintAddress]);

  return { slot, market, reserve, obligation, position, tokenBalances, mintAddress, inProgress, inputAmount, onSubmit };
}

function useInputAmount(decimals: number) {
  const [rawValue, setValue] = useState("");
  const nativeValue = useMemo(() => TokenAmount.toNative(rawValue, decimals), [rawValue, decimals]);
  return { value: { raw: rawValue, native: nativeValue }, setValue };
}

const MAX_AMOUNT = new Decimal(U64_MAX);
const EPS = new Decimal(1);

function computeSubmittedAmount(
  kind: ActionKind,
  inputAmount: Decimal,
  positionAmount: Decimal | null | undefined,
) {
  const canBeClosed = ActionKind.canBeClosed(kind);
  return canBeClosed ? computeClosePositionAmount(inputAmount, positionAmount) : inputAmount;
}

function computeClosePositionAmount(
  probeAmount: Decimal,
  positionAmount: Decimal | null | undefined,
) {
  if (positionAmount == null) {
    return probeAmount;
  }

  const diff = positionAmount.minus(probeAmount).abs();
  if (diff.lte(EPS)) {
    return MAX_AMOUNT;
  } else {
    return probeAmount;
  }
}

function extractPosition(
  kind: ActionKind,
  obligation: KaminoObligation | null | undefined,
  reserveAddress: PublicKey,
) {
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