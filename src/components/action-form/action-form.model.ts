import { createContext, useContext } from "react";
import { PublicKey } from "@solana/web3.js";
import { useMarket, useCustomer, Customer } from "../market/market.model";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";

export enum ActionKind {
  Supply,
  Borrow,
  Withdraw,
  Repay,
}

export module ActionKind {
  export function isClosePositionKind(tag: ActionKind) {
    return tag === ActionKind.Repay || tag === ActionKind.Supply;
  }
}

export interface Action {
  kind: ActionKind;
  mintAddress: PublicKey;
  isBorrowable: boolean;
}

export interface ActionFormContext {
  market: KaminoMarket | null | undefined;
  customer: Customer | null | undefined;

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