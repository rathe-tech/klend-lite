import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { KaminoObligation, VanillaObligation, PROGRAM_ID } from "@hubbleprotocol/kamino-lending-sdk";

import { Assert } from "../utils";
import { WSOL_MINT_ADDRESS } from "../config";
import { Market } from "./market";

export class Customer {
  #nativeObligation: KaminoObligation | null;
  #tokenBalances: Map<string, Decimal>;

  private constructor(nativeObligation: KaminoObligation | null, tokenBalances: Map<string, Decimal>) {
    this.#nativeObligation = nativeObligation;
    this.#tokenBalances = tokenBalances;
  }

  public getKaminoObligation() {
    return this.#nativeObligation;
  }

  public getDeposits() {
    return this.#nativeObligation?.deposits ?? [];
  }

  public getBorrows() {
    return this.#nativeObligation?.borrows ?? [];
  }

  public getTotalBorrowed() {
    return this.#nativeObligation
      ?.refreshedStats
      .userTotalBorrow
      .toDecimalPlaces(2) ?? new Decimal(0);
  }

  public getTotalSupplied() {
    return this.#nativeObligation
      ?.refreshedStats
      .userTotalDeposit
      .toDecimalPlaces(2) ?? new Decimal(0);
  }

  public getLtv() {
    return this.#nativeObligation
      ?.refreshedStats
      .loanToValue;
  }

  public getMaxLtv() {
    if (this.#nativeObligation != null) {
      const { borrowLimit, userTotalDeposit } = this.#nativeObligation.refreshedStats;
      return borrowLimit.div(userTotalDeposit);
    }
  }

  public getLiquidationLtv() {
    return this.#nativeObligation
      ?.refreshedStats
      .liquidationLtv;
  }

  public getTokenBalance(mintAddress: PublicKey) {
    return this.#tokenBalances.get(mintAddress.toBase58());
  }

  public static async load(market: Market, wallet: PublicKey) {
    const obligationType = new VanillaObligation(PROGRAM_ID);
    const nativeObligation = await market.getObligationByWallet(wallet, obligationType);
    const tokenBalances = await loadTokenBalances(market, wallet);
    return new Customer(nativeObligation, tokenBalances);
  }
}

async function loadTokenBalances(market: Market, wallet: PublicKey) {
  const connection = market.getKaminoMarket().getConnection();
  const mints = market.getMintAddresses();
  const solAccount = await connection.getAccountInfo(wallet);
  Assert.some(solAccount, "Native SOL account isn't loaded");

  const { value } = await connection.getTokenAccountsByOwner(wallet, { programId: TOKEN_PROGRAM_ID });
  const balances = new Map(value
    .map(x => AccountLayout.decode(x.account.data))
    .map(({ amount, mint }) => [mint.toBase58(), new Decimal(amount.toString(10))] as const)
    .filter(x => mints.has(x[0])));

  // Add native SOL balance.
  balances.set(WSOL_MINT_ADDRESS.toBase58(), new Decimal(solAccount.lamports));

  return balances;
}