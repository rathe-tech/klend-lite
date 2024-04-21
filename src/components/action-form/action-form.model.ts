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

export interface ActionFormContext {
  action: Action | null;
  open: (action: Action) => void;
  close: () => void;
};

export const ActionFormContext = createContext<ActionFormContext | null>(null);

export function useActionForm() {
  const actionForm = useContext(ActionFormContext);
  if (actionForm == null) {
    throw new Error("Could not use ActionFormContext outside ActionFormProvider");
  }

  return actionForm;
};