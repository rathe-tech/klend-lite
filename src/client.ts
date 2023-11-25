import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import {
  PROGRAM_ID,
  KaminoAction,
  KaminoMarket,
  VanillaObligation,
  buildVersionedTransaction
} from "@hubbleprotocol/kamino-lending-sdk";

import { Option } from "./utils";
import { DONATION_ADDRESS, LENDING_LUT, MARKET_ADDRESS } from "./config";
import { type Store } from "./store";

export class Client {
  #store: Store;
  #obligationType = new VanillaObligation(PROGRAM_ID);

  get #connection() { return this.#store.connection; }
  get #wallet() { return this.#store.wallet; }
  get #publicKey() { return Option.unwrap(this.#wallet.publicKey, "Wallet isn't connected"); }
  get #market() { return Option.unwrap(this.#store.market, "Market isn't loaded"); }

  public constructor(store: Store) {
    this.#store = store;
  }

  public async supply(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildDepositTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#publicKey,
      this.#obligationType,
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
      this.#publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  public async loadMarket() {
    return await KaminoMarket.load(this.#connection, MARKET_ADDRESS);
  }

  public async loadObligation() {
    return await this.#market.getObligationByWallet(this.#publicKey, this.#obligationType);
  }

  public async borrow(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildBorrowTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#publicKey,
      this.#obligationType,
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
      this.#publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  public async repay(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildRepayTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#publicKey,
      this.#obligationType,
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
      this.#publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }

  public async withdraw(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildWithdrawTxns(
      this.#market,
      amount.toString(),
      mintAddress,
      this.#publicKey,
      this.#obligationType,
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
      this.#publicKey,
      instructions,
      [LENDING_LUT]
    );
    return await this.#wallet.signAndSendTransaction(transaction);
  }
}