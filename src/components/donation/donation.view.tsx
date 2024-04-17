import { useMarket } from "@components/market-context";
import { DONATION_ADDRESS } from "@misc/config";
import * as css from "./donation.css";

export const Donation = () => {
  const { obligationState} = useMarket();

  if (!obligationState.isFetched) {
    return;
  }

  return (
    <div className={css.donation}>
      <div>Like the service? Consider making a donation:</div>
      <div 
        className={css.wallet}
        onClick={async () => {
          await navigator.clipboard.writeText(DONATION_ADDRESS.toBase58());
          alert("Wallet address copied!");
        }}
      >
        {DONATION_ADDRESS.toBase58()}
      </div>
    </div>
  );
};