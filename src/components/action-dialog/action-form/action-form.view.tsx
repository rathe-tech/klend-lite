import { PublicKey } from "@solana/web3.js";

import { Input } from "../input";
import { SubmitButton } from "../submit-button";
import { StatsSection } from "../stats-section";
import { CustomerBalances } from "../customer-balances";

import {
  ActionKind,
  useActionForm
} from "./action-form.model";
import * as css from "./action-form.css";

export const ActionForm = ({
  kind,
  mintAddress,
}: {
  kind: ActionKind,
  mintAddress: PublicKey,
}) => {
  const {
    slot, market, reserve, obligation, position, tokenBalances,
    inProgress, inputAmount, onSubmit,
  } = useActionForm({ kind, mintAddress });

  return (
    <div className={css.form}>
      <Input
        value={inputAmount.value.raw}
        decimals={reserve.stats.decimals}
        symbol={reserve.getTokenSymbol()}
        price={reserve.getOracleMarketPrice()}
        onChange={value => inputAmount.setValue(value)}
      />
      <StatsSection
        kind={kind}
        market={market}
        reserve={reserve}
        obligation={obligation}
        inputAmount={inputAmount.value.native}
        mintAddress={mintAddress}
        slot={slot}
      />
      <SubmitButton
        kind={kind}
        inProgress={inProgress}
        onSubmit={() => onSubmit(inputAmount.value.native)}
      />
      <CustomerBalances
        kind={kind}
        reserve={reserve}
        position={position}
        tokenBalances={tokenBalances}
        onWalletBalanceClick={v => inputAmount.setValue(v)}
        onPositionBalanceClick={v => inputAmount.setValue(v)}
      />
    </div>
  );
};