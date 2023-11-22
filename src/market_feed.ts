import { Connection } from "@solana/web3.js";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";
import { MARKET_ADDRESS } from "./config";

export enum MarketStatus {
  Loading,
  Error,
  Loaded,
}

export class MarketFeed {
  #connection: Connection;
  #market: KaminoMarket | null;
  #isLoading: boolean;

  #onLoadingListener: (() => void) | null;
  #onErrorListener: ((error: unknown) => void) | null;
  #onLoadedListener: ((market: KaminoMarket) => void) | null;

  public constructor(connection: Connection) {
    this.#connection = connection;
    this.#market = null;
    this.#isLoading = false;

    this.#onLoadingListener = null;
    this.#onErrorListener = null;
    this.#onLoadedListener = null;
  }

  public async refresh() {
    if (this.#isLoading) {
      return;
    }

    this.#isLoading = true;
    this.#onLoadingListener?.();

    try {
      if (this.#market == null) {
        this.#market =  await KaminoMarket.load(this.#connection, MARKET_ADDRESS);
      } else {
        await this.#market.refreshAll();
      }
      this.#onLoadedListener?.(this.#market!);
    } catch (e) {
      this.#onErrorListener?.(e);
    } finally {
      this.#isLoading = false;
    }
  }

  public on(status: MarketStatus.Loading, listener: () => void): void;
  public on(status: MarketStatus.Error, listener: (error: unknown) => void): void;
  public on(status: MarketStatus.Loaded, listener: (error: KaminoMarket) => void): void;
  public on(status: MarketStatus, listener: any): void {
    switch (status) {
      case MarketStatus.Loading:
        this.#onLoadingListener = listener;
        break;
      case MarketStatus.Error:
        this.#onErrorListener = listener;
        break;
      case MarketStatus.Loaded:
        this.#onLoadedListener = listener;
        break;
      default:
        throw new Error(`Unsupported status: ${status}`);
    }
  }
}