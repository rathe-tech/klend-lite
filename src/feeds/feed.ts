import { Connection } from "@solana/web3.js";

export enum FeedStatus {
  Loading,
  Error,
  Loaded,
}

export abstract class Feed<T> {
  #connection: Connection;
  #entity: T | null;
  #isLoading: boolean;

  #onLoadingListener: (() => void) | null;
  #onErrorListener: ((error: unknown) => void) | null;
  #onLoadedListener: ((entity: T) => void) | null;

  public constructor(connection: Connection) {
    this.#connection = connection;
    this.#entity = null;
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
      this.#entity = await this.onRefresh(this.#connection, this.#entity);
      this.#onLoadedListener?.(this.#entity!);
    } catch (e) {
      this.#onErrorListener?.(e);
    } finally {
      this.#isLoading = false;
    }
  }

  protected abstract onRefresh(connection: Connection, currentEntity: T | null): Promise<T>;

  public on(status: FeedStatus.Loading, listener: () => void): void;
  public on(status: FeedStatus.Error, listener: (error: unknown) => void): void;
  public on(status: FeedStatus.Loaded, listener: (entity: T) => void): void;
  public on(status: FeedStatus, listener: any): void {
    switch (status) {
      case FeedStatus.Loading:
        this.#onLoadingListener = listener;
        break;
      case FeedStatus.Error:
        this.#onErrorListener = listener;
        break;
      case FeedStatus.Loaded:
        this.#onLoadedListener = listener;
        break;
      default:
        throw new Error(`Unsupported status: ${status}`);
    }
  }
}