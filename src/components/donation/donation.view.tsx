import { DONATION_ADDRESS } from "@misc/config";
import * as css from "./donation.css";

export const Donation = () =>
  <div className={css.donation}>
    <div className={css.donationBody}>
      <h1 className={css.h1}>Welcome to KLEND</h1>
      <p className={css.p}>KLEND is a dApp for the Kamino lending markets focused to be:</p>
      <ul className={css.ul}>
        <li className={css.li}>Lightweight and fast</li>
        <li className={css.li}>A second UI in case the Kamino site is unavailable</li>
        <li className={css.li}>Open-source and free</li>
      </ul>
      <div className={css.donationWrapper}>
        <div>Like the app? Consider making a donation:</div>
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
    </div>
  </div>