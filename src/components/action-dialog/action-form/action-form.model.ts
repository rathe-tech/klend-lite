import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { KaminoObligation, U64_MAX } from "@kamino-finance/klend-sdk";
import { ActionParams, borrow, repay, supply, withdraw } from "@queries/api";
import { ActionKind } from "../action-dialog.model";

export { ActionKind };

const MAX_AMOUNT = new Decimal(U64_MAX);
const EPS = new Decimal(1);
const ZERO = new Decimal(0);

export function computeSubmittedAmount(
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

export function extractPosition(
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

export async function processAction(kind: ActionKind, params: ActionParams): Promise<string> {
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