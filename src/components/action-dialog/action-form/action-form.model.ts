import Decimal from "decimal.js";
import { Position, U64_MAX } from "@hubbleprotocol/kamino-lending-sdk";
import { ActionKind } from "../action-dialog.model";

export { ActionKind };

export function computeSubmittedAmount(
  kind: ActionKind,
  amount: Decimal,
  position?: Position | null | undefined
) {
  const canBeClosed = ActionKind.isClosePositionKind(kind);
  return canBeClosed ? computeClosePositionAmount(amount, position) : amount;
}

const MAX_AMOUNT = new Decimal(U64_MAX);
const EPS = new Decimal("1");

function computeClosePositionAmount(
  probeAmount: Decimal,
  position?: Position | null | undefined
) {
  if (position == null) {
    return probeAmount;
  }

  const diff = position.amount.minus(probeAmount).abs();
  if (diff.lte(EPS)) {
    return MAX_AMOUNT;
  } else {
    return probeAmount;
  }
}