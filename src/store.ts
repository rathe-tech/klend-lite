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
} from "./config";
import {
  ActionEventTag,
  MarketEventTag,
  ObligationEventTag,
  TransactionEventTag,
  WalletEventTag,
  emit,
  listen,
} from "./events";

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
      emit(WalletEventTag.Connect, {
        address: this.#wallet.publicKey!,
        context: this
      });
    });
    this.#wallet.on("disconnect", () => {
      emit(WalletEventTag.Disconnect, { context: this })
    });

    listen(WalletEventTag.Connect, async () => {
      await this.#loadMarket();
    });
    listen(WalletEventTag.Disconnect, () => {
      // Invalidate obligation if there's no active loading.
      // Otherwise it will be invalidated after the active loading is complete.
      if (!this.#isObligationLoading) {
        this.#obligation = null;
        emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
      }
      // Invalidate market if there's no active loading.
      // Otherwise it will be invalidated after the active loading is complete.
      // No need to invalidate if it's not loaded.
      if (!this.#isMarketLoading && this.#market != null) {
        emit(MarketEventTag.Loaded, { market: this.#market, context: this });
      }
    });

    listen(MarketEventTag.Loaded, async () => {
      // 1. After the market is loaded we can try to load an obligation in case the wallet is connected.
      // 2. If there's no connected wallet and no active loading presented set the current obligation
      //    to null and invalidate it.
      if (this.#wallet.isConnected) {
        await this.#loadObligation();
      } else if (!this.#isObligationLoading) {
        this.#obligation = null;
        emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
      }
    });

    listen(TransactionEventTag.Error, e => {
      console.error(e.detail.error);
      alert(`Could not process transaction.\n${e.detail.error}`);
    });
    listen(TransactionEventTag.Complete, async e => {
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
      emit(TransactionEventTag.Processing, { context: this });
      const signature = await this.#processAction(tag, mintAddress, amount);
      emit(TransactionEventTag.Complete, { signature, context: this });
    } catch (error) {
      emit(TransactionEventTag.Error, { error, context: this });
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
      PublicKey.default
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
      PublicKey.default,
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
      PublicKey.default
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
      PublicKey.default
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
      emit(MarketEventTag.Loading, { context: this });

      this.#market = await KaminoMarket.load(this.#connection, MARKET_ADDRESS);
      if (this.#market == null) throw new Error(`Could not load market: ${MARKET_ADDRESS}`);

      emit(MarketEventTag.Loaded, { market: this.#market, context: this });
    } catch (error) {
      emit(MarketEventTag.Error, { error, context: this });
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
      emit(ObligationEventTag.Loading, { context: this });

      if (this.#market == null) throw new Error("Market is unavailable");
      if (this.#wallet.publicKey == null) throw new Error("Wallet isn't connected");

      this.#obligation = await this.#market.getObligationByWallet(this.#wallet.publicKey, new VanillaObligation(PROGRAM_ID));

      emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
    } catch (error) {
      emit(ObligationEventTag.Error, { error, context: this });
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
}