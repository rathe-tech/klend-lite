import { Connection, PublicKey } from "@solana/web3.js";
import Solflare from "@solflare-wallet/sdk";
import Decimal from "decimal.js";
import { KaminoMarket, KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";

export interface Context {
  connection: Connection;
  wallet: Solflare;
  market: KaminoMarket | null;
  obligation: KaminoObligation | null;
  
  process(tag: ActionEventTag, mintAddress: PublicKey, amount: Decimal): Promise<void>;
}

export interface EventDetail {
  context: Context;
}

export enum WalletEventTag {
  Connect = "wallet:connect",
  Disconnect = "wallet:disconnect"
}

export interface WalletConnectEventDetail extends EventDetail {
  address: PublicKey;
}
export interface WalletDisconnectEventDetail extends EventDetail { }

export enum MarketEventTag {
  Loading = "market:loading",
  Loaded = "market:loaded",
  Error = "market:error",
}

export interface MarketLoadingEventDetail extends EventDetail { }
export interface MarketLoadedEventDetail extends EventDetail { 
  market: KaminoMarket;
}
export interface MarketErrorEventDetail extends EventDetail { 
  error: unknown;
}

export enum ObligationEventTag {
  Loading = "obligation:loading",
  Loaded = "obligation:loaded",
  Error = "obligation:error",
}

export interface ObligationLoadingEventDetail extends EventDetail { }
export interface ObligationLoadedEventDetail extends EventDetail { 
  obligation: KaminoObligation | null;
}
export interface ObligationErrorEventDetail extends EventDetail { 
  error: unknown;
}

export enum ActionEventTag {
  Supply = "klend:supply",
  Borrow = "klend:borrow",
  Repay = "klend:repay",
  Withdraw = "klend:withdraw",
}

export interface ActionSupplyEventDetail extends EventDetail {
  mintAddress: PublicKey;
}
export interface ActionBorrowEventDetail extends EventDetail {
  mintAddress: PublicKey;
}
export interface ActionRepayEventDetail extends EventDetail {
  mintAddress: PublicKey;
}
export interface ActionWithdrawEventDetail extends EventDetail {
  mintAddress: PublicKey;
}

export enum TransactionEventTag {
  Processing = "transaction:processing",
  Complete = "transaction:complete",
  Error = "transaction:error",
}

export interface TransactionProcessingEventDetail extends EventDetail { }
export interface TransactionCompleteEventDetail extends EventDetail {
  signature: string;
}
export interface TransactionErrorEventDetail extends EventDetail {
  error: unknown;
}

export function emit(tag: WalletEventTag.Connect, detail: WalletConnectEventDetail): void;
export function emit(tag: WalletEventTag.Disconnect, detail: WalletDisconnectEventDetail): void;

export function emit(tag: MarketEventTag.Loading, detail: MarketLoadingEventDetail): void;
export function emit(tag: MarketEventTag.Loaded, detail: MarketLoadedEventDetail): void;
export function emit(tag: MarketEventTag.Error, detail: MarketErrorEventDetail): void;

export function emit(tag: ObligationEventTag.Loading, detail: ObligationLoadingEventDetail): void;
export function emit(tag: ObligationEventTag.Loaded, detail: ObligationLoadedEventDetail): void;
export function emit(tag: ObligationEventTag.Error, detail: ObligationErrorEventDetail): void;

export function emit(tag: ActionEventTag.Supply, detail: ActionSupplyEventDetail): void;
export function emit(tag: ActionEventTag.Borrow, detail: ActionBorrowEventDetail): void;
export function emit(tag: ActionEventTag.Repay, detail: ActionRepayEventDetail): void;
export function emit(tag: ActionEventTag.Withdraw, detail: ActionWithdrawEventDetail): void;

export function emit(tag: TransactionEventTag.Processing, detail: TransactionProcessingEventDetail): void;
export function emit(tag: TransactionEventTag.Complete, detail: TransactionCompleteEventDetail): void;
export function emit(tag: TransactionEventTag.Error, detail: TransactionErrorEventDetail): void;

export function emit(tag: string, detail: any): void {
  const event = new CustomEvent(tag, {
    detail, 
    bubbles: true
  });
  document.dispatchEvent(event);
}

export function listen(tag: WalletEventTag.Connect, listener: (e: CustomEvent<WalletConnectEventDetail>) => void): void;
export function listen(tag: WalletEventTag.Disconnect, listener: (e: CustomEvent<WalletDisconnectEventDetail>) => void): void;

export function listen(tag: MarketEventTag.Loading, listener: (e: CustomEvent<MarketLoadingEventDetail>) => void): void;
export function listen(tag: MarketEventTag.Loaded, listener: (e: CustomEvent<MarketLoadedEventDetail>) => void): void;
export function listen(tag: MarketEventTag.Error, listener: (e: CustomEvent<MarketErrorEventDetail>) => void): void;

export function listen(tag: ObligationEventTag.Loading, listener: (e: CustomEvent<ObligationLoadingEventDetail>) => void): void;
export function listen(tag: ObligationEventTag.Loaded, listener: (e: CustomEvent<ObligationLoadedEventDetail>) => void): void;
export function listen(tag: ObligationEventTag.Error, listener: (e: CustomEvent<ObligationErrorEventDetail>) => void): void;

export function listen(tag: ActionEventTag.Supply, listener: (e: CustomEvent<ActionSupplyEventDetail>) => void): void;
export function listen(tag: ActionEventTag.Borrow, listener: (e: CustomEvent<ActionBorrowEventDetail>) => void): void;
export function listen(tag: ActionEventTag.Repay, listener: (e: CustomEvent<ActionRepayEventDetail>) => void): void;
export function listen(tag: ActionEventTag.Withdraw, listener: (e: CustomEvent<ActionWithdrawEventDetail>) => void): void;

export function listen(tag: TransactionEventTag.Processing, listener: (e: CustomEvent<TransactionProcessingEventDetail>) => void): void;
export function listen(tag: TransactionEventTag.Complete, listener: (e: CustomEvent<TransactionCompleteEventDetail>) => void): void;
export function listen(tag: TransactionEventTag.Error, listener: (e: CustomEvent<TransactionErrorEventDetail>) => void): void;

export function listen(tag: string, listener: (e: any) => void): void {
  document.addEventListener(tag, listener);
}