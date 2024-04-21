import { Connection } from "@solana/web3.js";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";
import { MarketInfo, RPC_ENDPOINT } from "@misc/config";

(async () => {
  const connection = new Connection(RPC_ENDPOINT);
  const market = await KaminoMarket.load(connection, MarketInfo.KNOWN_MARKETS[0].address);
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
        // Collateral yield bearing token supply
        mintTotalSupply,
      },
    } = reserve;
    const totalSupply = reserve.getTotalSupply();
    const totalBorrows = reserve.getBorrowedAmount();
    const depositTvl = reserve.getDepositTvl();

    console.log("Symbol: %o", symbol);
    console.log("Decimals: %o", decimals);
    console.log("Reserve address: %o (https://explorer.solana.com/address/%s)", address.toBase58(), address.toBase58());
    console.log("Mint address: %o (https://explorer.solana.com/address/%s)", mintAddress, mintAddress);
    console.log("Loan to value: %o", loanToValuePct);
    console.log("Reserve deposit limit: %o (%o)", reserveDepositLimit.div(10 ** decimals).toDecimalPlaces(decimals).toString(), reserveDepositLimit);
    console.log("Reserve borrow limit: %o (%o)", reserveBorrowLimit.div(10 ** decimals).toDecimalPlaces(decimals).toString(), reserveBorrowLimit);
    console.log("Mint total supply: %o", mintTotalSupply.toString());
    console.log("Total supply: %o (%o)", totalSupply.div(10 ** decimals).toDecimalPlaces(decimals).toString(), totalSupply);
    console.log("Total borrows: %o (%o)", totalBorrows.div(10 ** decimals).toDecimalPlaces(decimals).toString(), totalBorrows);
    console.log("Deposit TVL (USD): %o", depositTvl);
    console.log();
  });
})();