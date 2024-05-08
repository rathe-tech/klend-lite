import Decimal from "decimal.js";
import { useCallback, useState } from "react";
import { ActionParams, borrow, repay, supply, withdraw } from "@queries/api";

import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { KaminoObligation, U64_MAX } from "@kamino-finance/klend-sdk";

import { ZERO } from "@misc/config";
import { Assert, UIUtils } from "@misc/utils";
import { useMarket } from "@components/market-context";
import { ActionKind } from "../action-dialog.model";

export { ActionKind };

export function useActionForm({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();

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

  const [inputAmount, setInputAmount] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const { address: reserveAddress } = reserve;
  const position = extractPosition(kind, obligation, reserveAddress);

  const positionAmount = position?.amount ?? ZERO;
  const { stats: { decimals } } = reserve;

  const onSubmit = useCallback(async (rawAmount: string) => {
    try {
      setInProgress(true);
      const inputAmount = UIUtils.toNativeNumber(rawAmount, decimals);
      const amount = computeSubmittedAmount(kind, inputAmount, positionAmount);
      const txId = await processAction(kind, {
        sendTransaction,
        connection,
        market: market!,
        walletAddress: publicKey!,
        mintAddress,
        amount,
        lutAddress,
      });

      alert(`Transaction complete: ${txId}`);
      await refresh();
    } catch (e: any) {
      alert(e.toString());
      console.log(e);
    } finally {
      setInProgress(false);
    }
  }, [kind, mintAddress]);

  return { slot, reserve, position, tokenBalances, inProgress, inputAmount, setInputAmount, onSubmit };
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