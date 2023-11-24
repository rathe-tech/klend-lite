import { Connection, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import Solflare from "@solflare-wallet/sdk";
import {
  KaminoMarket,
  KaminoObligation,
  VanillaObligation,
  KaminoAction,
  buildVersionedTransaction,
  PROGRAM_ID,
} from "@hubbleprotocol/kamino-lending-sdk";

import {
  RPC_ENDPOINT,
  MARKET_ADDRESS,
  LENDING_LUT,
  DONATION_ADDRESS,
} from "./config";

export class Store {
  #connection: Connection = new Connection(RPC_ENDPOINT, { commitment: "confirmed" });
  #wallet: Solflare = new Solflare({ network: "mainnet-beta" });
  #market: KaminoMarket | null = null;
  #obligation: KaminoObligation | null = null;

  #isMarketLoading = false;
  #isObligationLoading = false;
  #isTransactionLoading = false;

  public get connection() { return this.#connection; }
  public get wallet() { return this.#wallet; }
  public get market() { return this.#market; }
  public get obligation() { return this.#obligation; }

  public constructor() {
    this.#wallet.on("connect", () => {
      this.emit(WalletEventTag.Connect, {
        address: this.#wallet.publicKey!,
        store: this
      });
    });
    this.#wallet.on("disconnect", () => {
      this.emit(WalletEventTag.Disconnect, { store: this })
    });

    this.listen(WalletEventTag.Connect, async () => {
      await this.#loadMarket();
    });
    this.listen(WalletEventTag.Disconnect, () => {
      // Invalidate obligation if there's no active loading.
      // Otherwise it will be invalidated after the active loading is complete.
      if (!this.#isObligationLoading) {
        this.#obligation = null;
        this.emit(ObligationEventTag.Loaded, { obligation: this.#obligation, store: this });
      }
      // Invalidate market if there's no active loading.
      // Otherwise it will be invalidated after the active loading is complete.
      // No need to invalidate if it's not loaded.
      if (!this.#isMarketLoading && this.#market != null) {
        this.emit(MarketEventTag.Loaded, { market: this.#market, store: this });
      }
    });

    this.listen(MarketEventTag.Loaded, async () => {
      // 1. After the market is loaded we can try to load an obligation in case the wallet is connected.
      // 2. If there's no connected wallet and no active loading presented set the current obligation
      //    to null and invalidate it.
      if (this.#wallet.isConnected) {
        await this.#loadObligation();
      } else if (!this.#isObligationLoading) {
        this.#obligation = null;
        this.emit(ObligationEventTag.Loaded, { obligation: this.#obligation, store: this });
      }
    });

    this.listen(TransactionEventTag.Error, e => {
      console.error(e.detail.error);
      alert(`Could not process transaction.\n${e.detail.error}`);
    });
    this.listen(TransactionEventTag.Complete, async e => {
      alert(`Transaction complete: ${e.detail.signature}`);
      await this.#loadMarket();
    });
  }

  public async process(tag: ActionEventTag, mintAddress: PublicKey, amount: Decimal): Promise<void> {
    if (this.#isTransactionLoading) {
      return;
    } else {
      this.#isTransactionLoading = true;
    }

    try {
      this.emit(TransactionEventTag.Processing, { store: this });
      const signature = await this.#processAction(tag, mintAddress, amount);
      this.emit(TransactionEventTag.Complete, { signature, store: this });
    } catch (error) {
      this.emit(TransactionEventTag.Error, { error, store: this });
    } finally {
      this.#isTransactionLoading = false;
    }
  }

  async #processAction(tag: ActionEventTag, mintAddress: PublicKey, amount: Decimal): Promise<string> {
    switch (tag) {
      case ActionEventTag.Supply:
        return await this.#supply(mintAddress, amount);
      case ActionEventTag.Borrow:
        return await this.#borrow(mintAddress, amount);
      case ActionEventTag.Repay:
        return await this.#repay(mintAddress, amount);
      case ActionEventTag.Withdraw:
        return await this.#withdraw(mintAddress, amount);
      default:
        throw new Error(`Not support action: ${tag}`);
    }
  }

  async #supply(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    if (this.#wallet.publicKey == null) {
      throw new Error("Wallet isn't connected");
    }
    if (this.#market == null) {
      throw new Error("Market isn't loaded");
    }

    const type = new VanillaObligation(PROGRAM_ID);
    const action = await KaminoAction.buildDepositTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#wallet.publicKey,
      type,
      0,
      undefined,
      undefined,
      undefined,
      DONATION_ADDRESS
    );
    const instructions = [
      ...action.setupIxs,
      ...action.lendingIxs,
      ...action.cleanupIxs,
    ];
    const transaction = await buildVersionedTransaction(
      this.#connection,
      this.#wallet.publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  async #borrow(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    if (this.#wallet.publicKey == null) {
      throw new Error("Wallet isn't connected");
    }
    if (this.#market == null) {
      throw new Error("Market isn't loaded");
    }

    const type = new VanillaObligation(PROGRAM_ID);
    const action = await KaminoAction.buildBorrowTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#wallet.publicKey,
      type,
      0,
      true,
      false,
      true,
      DONATION_ADDRESS,
    );
    const instructions = [
      ...action.setupIxs,
      ...action.lendingIxs,
      ...action.cleanupIxs,
    ];
    const transaction = await buildVersionedTransaction(
      this.#connection,
      this.#wallet.publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  async #repay(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    if (this.#wallet.publicKey == null) {
      throw new Error("Wallet isn't connected");
    }
    if (this.#market == null) {
      throw new Error("Market isn't loaded");
    }

    const type = new VanillaObligation(PROGRAM_ID);
    const action = await KaminoAction.buildRepayTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#wallet.publicKey,
      type,
      0,
      true,
      undefined,
      undefined,
      DONATION_ADDRESS
    );
    const instructions = [
      ...action.setupIxs,
      ...action.lendingIxs,
      ...action.cleanupIxs,
    ];
    const transaction = await buildVersionedTransaction(
      this.#connection,
      this.#wallet.publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  async #withdraw(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    if (this.#wallet.publicKey == null) {
      throw new Error("Wallet isn't connected");
    }
    if (this.#market == null) {
      throw new Error("Market isn't loaded");
    }

    const type = new VanillaObligation(PROGRAM_ID);
    const action = await KaminoAction.buildWithdrawTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#wallet.publicKey,
      type,
      0,
      true,
      undefined,
      undefined,
      DONATION_ADDRESS
    );
    const instructions = [
      ...action.setupIxs,
      ...action.lendingIxs,
      ...action.cleanupIxs,
    ];
    const transaction = await buildVersionedTransaction(
      this.#connection,
      this.#wallet.publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  public async refresh() {
    await this.#loadMarket();
  }

  async #loadMarket() {
    if (this.#isMarketLoading) {
      return;
    } else {
      this.#isMarketLoading = true;
    }

    try {
      this.emit(MarketEventTag.Loading, { store: this });

      this.#market = await KaminoMarket.load(this.#connection, MARKET_ADDRESS);
      if (this.#market == null) throw new Error(`Could not load market: ${MARKET_ADDRESS}`);

      this.emit(MarketEventTag.Loaded, { market: this.#market, store: this });
    } catch (error) {
      this.emit(MarketEventTag.Error, { error, store: this });
    } finally {
      this.#isMarketLoading = false;
    }
  }

  async #loadObligation() {
    if (this.#isObligationLoading) {
      return;
    } else {
      this.#isObligationLoading = true;
    }

    try {
      this.emit(ObligationEventTag.Loading, { store: this });

      if (this.#market == null) throw new Error("Market is unavailable");
      if (this.#wallet.publicKey == null) throw new Error("Wallet isn't connected");

      this.#obligation = await this.#market.getObligationByWallet(this.#wallet.publicKey, new VanillaObligation(PROGRAM_ID));

      this.emit(ObligationEventTag.Loaded, { obligation: this.#obligation, store: this });
    } catch (error) {
      this.emit(ObligationEventTag.Error, { error, store: this });
    } finally {
      this.#isObligationLoading = false;
    }
  }

  public getMint(mintAddress: PublicKey) {
    if (this.market == null) {
      throw new Error("Market isn't loaded");
    }

    const base58MintAddress = mintAddress.toBase58();
    const reserve = this.market.reserves.find(x => x.stats.mintAddress === base58MintAddress);
    if (reserve == null) {
      throw new Error(`Reserve form mint ${mintAddress} doesn't exist`);
    }

    const { stats: { decimals, symbol } } = reserve;
    return { mintAddress, decimals, symbol };
  }

  public emit(tag: WalletEventTag.Connect, detail: WalletConnectEventDetail): void;
  public emit(tag: WalletEventTag.Disconnect, detail: WalletDisconnectEventDetail): void;

  public emit(tag: MarketEventTag.Loading, detail: MarketLoadingEventDetail): void;
  public emit(tag: MarketEventTag.Loaded, detail: MarketLoadedEventDetail): void;
  public emit(tag: MarketEventTag.Error, detail: MarketErrorEventDetail): void;

  public emit(tag: ObligationEventTag.Loading, detail: ObligationLoadingEventDetail): void;
  public emit(tag: ObligationEventTag.Loaded, detail: ObligationLoadedEventDetail): void;
  public emit(tag: ObligationEventTag.Error, detail: ObligationErrorEventDetail): void;

  public emit(tag: ActionEventTag.Supply, detail: ActionSupplyEventDetail): void;
  public emit(tag: ActionEventTag.Borrow, detail: ActionBorrowEventDetail): void;
  public emit(tag: ActionEventTag.Repay, detail: ActionRepayEventDetail): void;
  public emit(tag: ActionEventTag.Withdraw, detail: ActionWithdrawEventDetail): void;

  public emit(tag: TransactionEventTag.Processing, detail: TransactionProcessingEventDetail): void;
  public emit(tag: TransactionEventTag.Complete, detail: TransactionCompleteEventDetail): void;
  public emit(tag: TransactionEventTag.Error, detail: TransactionErrorEventDetail): void;

  public emit(tag: string, detail: any): void {
    const event = new CustomEvent(tag, {
      detail,
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  public listen(tag: WalletEventTag.Connect, listener: (e: CustomEvent<WalletConnectEventDetail>) => void): void;
  public listen(tag: WalletEventTag.Disconnect, listener: (e: CustomEvent<WalletDisconnectEventDetail>) => void): void;

  public listen(tag: MarketEventTag.Loading, listener: (e: CustomEvent<MarketLoadingEventDetail>) => void): void;
  public listen(tag: MarketEventTag.Loaded, listener: (e: CustomEvent<MarketLoadedEventDetail>) => void): void;
  public listen(tag: MarketEventTag.Error, listener: (e: CustomEvent<MarketErrorEventDetail>) => void): void;

  public listen(tag: ObligationEventTag.Loading, listener: (e: CustomEvent<ObligationLoadingEventDetail>) => void): void;
  public listen(tag: ObligationEventTag.Loaded, listener: (e: CustomEvent<ObligationLoadedEventDetail>) => void): void;
  public listen(tag: ObligationEventTag.Error, listener: (e: CustomEvent<ObligationErrorEventDetail>) => void): void;

  public listen(tag: ActionEventTag.Supply, listener: (e: CustomEvent<ActionSupplyEventDetail>) => void): void;
  public listen(tag: ActionEventTag.Borrow, listener: (e: CustomEvent<ActionBorrowEventDetail>) => void): void;
  public listen(tag: ActionEventTag.Repay, listener: (e: CustomEvent<ActionRepayEventDetail>) => void): void;
  public listen(tag: ActionEventTag.Withdraw, listener: (e: CustomEvent<ActionWithdrawEventDetail>) => void): void;

  public listen(tag: TransactionEventTag.Processing, listener: (e: CustomEvent<TransactionProcessingEventDetail>) => void): void;
  public listen(tag: TransactionEventTag.Complete, listener: (e: CustomEvent<TransactionCompleteEventDetail>) => void): void;
  public listen(tag: TransactionEventTag.Error, listener: (e: CustomEvent<TransactionErrorEventDetail>) => void): void;

  public listen(tag: string, listener: (e: any) => void): void {
    document.addEventListener(tag, listener);
  }
}

export interface EventDetail {
  store: Store;
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