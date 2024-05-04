import { createContext, useContext } from "react";
import { PublicKey } from "@solana/web3.js";
import { ActionType } from "@kamino-finance/klend-sdk";

export enum ActionKind {
  Supply,
  Borrow,
  Withdraw,
  Repay,
}

export module ActionKind {
  export function canBeClosed(kind: ActionKind) {
    return kind === ActionKind.Repay || kind === ActionKind.Withdraw;
  }

  export function isDepositRelated(kind: ActionKind) {
    return kind === ActionKind.Supply || kind === ActionKind.Withdraw;
  }

  export function isBorrowRelated(kind: ActionKind) {
    return kind === ActionKind.Borrow || kind === ActionKind.Repay;
  }

  export function toActionType(kind: ActionKind): ActionType {
    switch (kind) {
      case ActionKind.Borrow:
        return "borrow";
      case ActionKind.Repay:
        return "repay";
      case ActionKind.Supply:
        return "deposit";
      case ActionKind.Withdraw:
        return "withdraw";
      default:
        throw new Error(`Unsupported ActionKind: ${kind}`);
    }
  }
}

export interface Action {
  kind: ActionKind;
  mintAddress: PublicKey;
  isBorrowable: boolean;
}

export interface ActionDialogContext {
  action: Action | null;
  open: (action: Action) => void;
  close: () => void;
};

export const ActionDialogContext = createContext<ActionDialogContext | null>(null);

export function useActionDialog() {
  const actionDialog = useContext(ActionDialogContext);
  if (actionDialog == null) {
    throw new Error("Could not use ActionDialogContext outside ActionDialogProvider");
  }

  return actionDialog;
};