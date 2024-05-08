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
    slot, reserve, position, tokenBalances,
    inProgress, inputAmount, setInputAmount, onSubmit,
  } = useActionForm({ kind, mintAddress });

  return (
    <div className={css.form}>
      <Input
        value={inputAmount}
        decimals={reserve.stats.decimals}
        symbol={reserve.getTokenSymbol()}
        price={reserve.getOracleMarketPrice()}
        onChange={value => setInputAmount(value)}
      />
      <StatsSection
        kind={kind}
        reserve={reserve}
        inputAmount={inputAmount}
        decimals={reserve.stats.decimals}
        slot={slot}
      />
      <SubmitButton
        kind={kind}
        inProgress={inProgress}
        onSubmit={() => onSubmit(inputAmount)}
      />
      <CustomerBalances
        kind={kind}
        reserve={reserve}
        position={position}
        tokenBalances={tokenBalances}
        onWalletBalanceClick={v => setInputAmount(v)}
        onPositionBalanceClick={v => setInputAmount(v)}
      />
    </div>
  );
};