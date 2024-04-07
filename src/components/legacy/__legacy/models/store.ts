import Decimal from "decimal.js";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";

import { Option } from "../../../../utils";
import { RPC_ENDPOINT, MARKETS, MarketInfo } from "../../../../config";

import { Api } from "./api";
import { Market } from "./market";
import { Customer } from "./customer";

export class Store {
  #connection = new Connection(RPC_ENDPOINT, { commitment: "confirmed" });
  #wallet: any
  #api = new Api(this);

  #marketInfo: MarketInfo;
  #market: Market | null = null;
  #customer: Customer | null = null;

  #isMarketLoading = false;
  #isCustomerLoading = false;
  #isTransactionLoading = false;

  get connection() { return this.#connection; }
  get wallet() { return this.#wallet; }
  get marketInfo() { return this.#marketInfo; }
  get market() { return this.#market; }
  get customer() { return this.#customer; }

  get marketChecked() { return Option.unwrap(this.#market, "Market isn't loaded"); }
  get customerChecked() { return Option.unwrap(this.#customer, "Customer isn't loaded"); }

  get hasMarket() { return this.#market != null; }
  get hasCustomer() { return this.#customer != null; }

  public constructor() {
    const searchParams = new URLSearchParams(window.location.search);
    const rawMarketAddress = searchParams.get("marketAddress");
    const marketAddress = rawMarketAddress ? new PublicKey(rawMarketAddress) : MARKETS[0].address;
    const foundMarket = MARKETS.find(x => x.address.equals(marketAddress));
    this.#marketInfo = Option.unwrap(foundMarket, "Invalid market address");

    document.addEventListener("legacy:connect", (e: any) => {
      const { publicKey, signTransaction, sendTransaction, connection } = e.detail;
      this.#wallet = { publicKey, signTransaction, sendTransaction, isConnected: true, connection };
      this.emit(WalletEventTag.Connect, {
        address: publicKey,
        store: this
      });
    });
    document.addEventListener("legacy:disconnect", () => {
      this.#wallet.publicKey = null;
      this.#wallet.isConnected = false;
      this.emit(WalletEventTag.Disconnect, { store: this })
    });

    this.listen(WalletEventTag.Connect, async () => {
      await this.#loadMarket();
    });
    this.listen(WalletEventTag.Disconnect, () => {
      this.#customer = null;
    });

    this.listen(MarketEventTag.Loaded, async () => {
      await this.#loadCustomer();
    });

    this.listen(MarketEventTag.Error, e => {
      console.error(e.detail.error);
      alert(`Can not load market: ${JSON.stringify(e.detail.error)}`);
    });
    this.listen(CustomerEventTag.Error, e => {
      console.error(e);
      alert(`Can not load customer: ${JSON.stringify(e.detail.error)}`);
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
        return await this.#api.supply(mintAddress, amount);
      case ActionEventTag.Borrow:
        return await this.#api.borrow(mintAddress, amount);
      case ActionEventTag.Repay:
        return await this.#api.repay(mintAddress, amount);
      case ActionEventTag.Withdraw:
        return await this.#api.withdraw(mintAddress, amount);
      default:
        throw new Error(`Not support action: ${tag}`);
    }
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
      this.#market = await this.#api.loadMarket();
      this.emit(MarketEventTag.Loaded, { market: this.marketChecked, store: this });
    } catch (error) {
      this.emit(MarketEventTag.Error, { error, store: this });
    } finally {
      this.#isMarketLoading = false;
    }
  }

  async #loadCustomer() {
    if (this.#isCustomerLoading || !this.wallet.isConnected) {
      return;
    } else {
      this.#isCustomerLoading = true;
    }

    try {
      this.emit(CustomerEventTag.Loading, { store: this });
      this.#customer = await this.#api.loadCustomer();
      this.emit(CustomerEventTag.Loaded, { customer: this.customerChecked, store: this });
    } catch (error) {
      this.emit(CustomerEventTag.Error, { error, store: this });
    } finally {
      this.#isCustomerLoading = false;
    }
  }

  public emit(tag: WalletEventTag.Connect, detail: WalletConnectEventDetail): void;
  public emit(tag: WalletEventTag.Disconnect, detail: WalletDisconnectEventDetail): void;

  public emit(tag: MarketEventTag.Loading, detail: MarketLoadingEventDetail): void;
  public emit(tag: MarketEventTag.Loaded, detail: MarketLoadedEventDetail): void;
  public emit(tag: MarketEventTag.Error, detail: MarketErrorEventDetail): void;

  public emit(tag: CustomerEventTag.Loading, detail: CustomerLoadingEventDetail): void;
  public emit(tag: CustomerEventTag.Loaded, detail: CustomerLoadedEventDetail): void;
  public emit(tag: CustomerEventTag.Error, detail: CustomerErrorEventDetail): void;

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

  public listen(tag: CustomerEventTag.Loading, listener: (e: CustomEvent<CustomerLoadingEventDetail>) => void): void;
  public listen(tag: CustomerEventTag.Loaded, listener: (e: CustomEvent<CustomerLoadedEventDetail>) => void): void;
  public listen(tag: CustomerEventTag.Error, listener: (e: CustomEvent<CustomerErrorEventDetail>) => void): void;

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

// Events declarations
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
  market: Market;
}
export interface MarketErrorEventDetail extends EventDetail {
  error: unknown;
}

export enum CustomerEventTag {
  Loading = "customer:loading",
  Loaded = "customer:loaded",
  Error = "customer:error",
}

export interface CustomerLoadingEventDetail extends EventDetail { }
export interface CustomerLoadedEventDetail extends EventDetail {
  customer: Customer;
}
export interface CustomerErrorEventDetail extends EventDetail {
  error: unknown;
}

export enum ActionEventTag {
  Supply = "klend:supply",
  Borrow = "klend:borrow",
  Repay = "klend:repay",
  Withdraw = "klend:withdraw",
}

export module ActionEventTag {
  export function isClosePositionTag(tag: ActionEventTag) {
    return tag === ActionEventTag.Repay || tag === ActionEventTag.Supply;
  }
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