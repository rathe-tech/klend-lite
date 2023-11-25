import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";
import {
  PROGRAM_ID,
  KaminoAction,
  KaminoMarket,
  VanillaObligation,
  buildVersionedTransaction
} from "@hubbleprotocol/kamino-lending-sdk";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Assert, Option } from "./utils";
import { DONATION_ADDRESS, LENDING_LUT, MARKET_ADDRESS, WSOL_MINT_ADDRESS } from "./config";
import { type Store } from "./store";

export class Client {
  #store: Store;
  #obligationType = new VanillaObligation(PROGRAM_ID);

  get #connection() { return this.#store.connection; }
  get #wallet() { return this.#store.wallet; }

  get #publicKey() { return Option.unwrap(this.#wallet.publicKey, "Wallet isn't connected"); }
  get #market() { return Option.unwrap(this.#store.market, "Market isn't loaded"); }
  get #mints() { return Option.unwrap(this.#store.mints, "Mints aren't available"); }

  public constructor(store: Store) {
    this.#store = store;
  }

  public async loadMarket() {
    return await KaminoMarket.load(this.#connection, MARKET_ADDRESS);
  }

  public async loadObligation() {
    return await this.#market.getObligationByWallet(this.#publicKey, this.#obligationType);
  }

  public async loadBalances() {
    const mints = this.#mints;

    const solAccount = await this.#connection.getAccountInfo(this.#publicKey);
    Assert.some(solAccount, "Native SOL account isn't loaded");

    const { value } = await this.#connection.getTokenAccountsByOwner(this.#publicKey, { programId: TOKEN_PROGRAM_ID });
    const balances = new Map(value
      .map(x => AccountLayout.decode(x.account.data))
      .map(({ amount, mint }) => [mint.toBase58(), new Decimal(amount.toString(10))] as const)
      .filter(x => mints.has(x[0])));

    // Add native SOL balance.
    balances.set(WSOL_MINT_ADDRESS.toBase58(), new Decimal(solAccount.lamports));

    return balances;
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