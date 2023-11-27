import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import {
  PROGRAM_ID,
  KaminoAction,
  VanillaObligation,
  buildVersionedTransaction
} from "@hubbleprotocol/kamino-lending-sdk";

import { Option } from "../utils";
import { Market } from "./market";
import { Customer } from "./customer";
import { LENDING_LUT, DONATION_ADDRESS, MARKET_ADDRESS } from "../config";
import { type Store } from "./store";

export class Api {
  #store: Store;
  #obligationType = new VanillaObligation(PROGRAM_ID);

  get #connection() { return this.#store.connection; }
  get #wallet() { return this.#store.wallet; }
  get #market() { return this.#store.marketChecked };
  get #publicKey() { return Option.unwrap(this.#wallet.publicKey, "Wallet isn't connected"); }

  public constructor(store: Store) {
    this.#store = store;
  }

  public async loadMarket() {
    return Market.load(this.#connection, MARKET_ADDRESS);
  }

  public async loadCustomer() {
    return Customer.load(this.#market, this.#publicKey);
  }

  public async supply(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildDepositTxns(
      this.#market.getKaminoMarket(),
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
    const signed = await this.#wallet.signTransaction(transaction);
    return await this.#connection.sendRawTransaction(signed.serialize());
  }

  public async borrow(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildBorrowTxns(
      this.#market.getKaminoMarket(),
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
    const signed = await this.#wallet.signTransaction(transaction);
    return await this.#connection.sendRawTransaction(signed.serialize());
  }

  public async repay(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildRepayTxns(
      this.#market.getKaminoMarket(),
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
    const signed = await this.#wallet.signTransaction(transaction);
    return await this.#connection.sendRawTransaction(signed.serialize());
  }

  public async withdraw(mintAddress: PublicKey, amount: Decimal): Promise<string> {
    const action = await KaminoAction.buildWithdrawTxns(
      this.#market.getKaminoMarket(),
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
    const signed = await this.#wallet.signTransaction(transaction);
    return await this.#connection.sendRawTransaction(signed.serialize());
  }
}