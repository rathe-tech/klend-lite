import { createContext, useContext } from "react";
import { PublicKey } from "@solana/web3.js";

export enum ActionKind {
  Supply,
  Borrow,
  Withdraw,
  Repay,
}

export module ActionKind {
  export function isClosePositionKind(kind: ActionKind) {
    return kind === ActionKind.Repay || kind === ActionKind.Withdraw;
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