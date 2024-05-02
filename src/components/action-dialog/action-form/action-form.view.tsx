import { useCallback, useState } from "react";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { KaminoReserve } from "@kamino-finance/klend-sdk";

import { useMarket } from "@components/market-context";
import { Assert, UIUtils } from "@misc/utils";

import { StatInfo } from "../stat-info";
import { Input } from "../input";
import { SubmitButton } from "../submit-button";
import { CustomerBalances } from "../customer-balances";

import { ActionKind, computeSubmittedAmount, extractPosition, processAction } from "./action-form.model";
import * as css from "./action-form.css";

export function useAction({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) {
  const {
    marketInfo,
    marketState: { data: market },
    tokenBalancesState: { data: tokenBalances },
    obligationState: { data: obligation },
    refresh,
  } = useMarket();

  Assert.some(market, "Market not loaded");
  Assert.some(tokenBalances, "Token balances not loaded");

  const reserve = market.getReserveByMint(mintAddress);
  Assert.some(reserve, "Reserve not loaded");

  const { address: reserveAddress } = reserve;
  const position = extractPosition(kind, obligation, reserveAddress);

  return { marketInfo, market, reserve, position, tokenBalances, refresh };
}

export const ActionForm = ({ kind, mintAddress }: { kind: ActionKind, mintAddress: PublicKey }) => {
  const { marketInfo: { lutAddress }, market, reserve, position, tokenBalances, refresh } = useAction({ kind, mintAddress });
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();

  const [value, setValue] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const positionAmount = position?.amount ?? new Decimal(0);
  const { stats: { decimals } } = reserve;

  const onSubmit = useCallback(async (value: string) => {
    try {
      setInProgress(true);
      const inputAmount = UIUtils.toNativeNumber(value.replaceAll(",", "").trim(), decimals);
      const amount = computeSubmittedAmount(kind, inputAmount, positionAmount);
      const txId = await processAction(kind, {
        sendTransaction,
        connection,
        market: market!,
        walletAddress: publicKey!,
        mintAddress,
        amount,
        lutAddress,
      });

      alert(`Transaction complete: ${txId}`);
      await refresh();
    } catch (e: any) {
      alert(e.toString());
      console.log(e);
    } finally {
      setInProgress(false);
    }
  }, [kind, mintAddress]);

  return (
    <div className={css.form}>
      <Input
        value={value}
        symbol={reserve.getTokenSymbol()}
        price={reserve.getReserveMarketPrice()}
        onChange={value => setValue(value)}
      />
      <BorrowFeeStatInfo
        kind={kind}
        reserve={reserve}
      />
      <SubmitButton
        kind={kind}
        inProgress={inProgress}
        onSubmit={() => onSubmit(value)}
      />
      <CustomerBalances
        kind={kind}
        reserve={reserve}
        position={position}
        tokenBalances={tokenBalances}
        onWalletBalanceClick={v => setValue(v)}
        onPositionBalanceClick={v => setValue(v)}
      />
    </div>
  );
};

const BorrowFeeStatInfo = ({
  kind,
  reserve,
}: {
  kind: ActionKind,
  reserve: KaminoReserve,
}) => {
  if (kind !== ActionKind.Borrow) return;

  const borrowFee = UIUtils.toFormattedPercent(
    reserve.getBorrowFee(),
    Math.max(0, reserve.getBorrowFee().dp() - 2)
  );
  return <StatInfo label="Borrow fee" value={borrowFee} />
};