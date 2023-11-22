import { Connection, VersionedTransaction } from "@solana/web3.js";
import Solflare from "@solflare-wallet/sdk";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";
import { MARKET_ADDRESS, RPC_ENDPOINT } from "../src/config";

(async () => {
  const connection = new Connection(RPC_ENDPOINT);
  const market = await KaminoMarket.load(connection, MARKET_ADDRESS);
  if (market == null) {
    throw new Error("Couldn't load market");
  }
  const { reserves } = market;
  reserves.forEach(reserve => {
    const {
      symbol,
      address,
      stats: {
        // Token decimals
        decimals,
        // Token address
        mintAddress,
        loanToValuePct,
        // Max token amount to deposit
        reserveDepositLimit,
        // Max token amount to borrow
        reserveBorrowLimit,
        totalLiquidity,
        totalSupply,
        totalBorrows,
        // Collateral yield bearing token supply
        mintTotalSupply,
        // TVL in USD
        depositTvl,
      },
    } = reserve;

    console.log("Symbol: %o", symbol);
    console.log("Decimals: %o", decimals);
    console.log("Reserve address: %o (https://explorer.solana.com/address/%s)", address.toBase58(), address.toBase58());
    console.log("Mint address: %o (https://explorer.solana.com/address/%s)", mintAddress, mintAddress);
    console.log("Loan to value: %o", loanToValuePct);
    console.log("Reserve deposit limit: %o (%o)", reserveDepositLimit.div(10 ** decimals).toDecimalPlaces(decimals).toString(), reserveDepositLimit);
    console.log("Reserve borrow limit: %o (%o)", reserveBorrowLimit.div(10 ** decimals).toDecimalPlaces(decimals).toString(), reserveBorrowLimit);
    console.log("Mint total supply: %o", mintTotalSupply.toString());
    console.log("Total supply: %o (%o)", totalSupply.div(10 ** decimals).toDecimalPlaces(decimals).toString(), totalSupply);
    console.log("Computed total supply: %o (%o)", totalBorrows.plus(totalLiquidity).div(10 ** decimals).toDecimalPlaces(decimals).toString(), totalBorrows.plus(totalLiquidity));
    console.log("Total borrows: %o (%o)", totalBorrows.div(10 ** decimals).toDecimalPlaces(decimals).toString(), totalBorrows);
    console.log("Total liquidity: %o (%o)", totalLiquidity.div(10 ** decimals).toDecimalPlaces(decimals).toString(), totalLiquidity);
    console.log("Deposit TVL (USD): %o", depositTvl);
    console.log();
  });

  const wallet = new Solflare();
})();