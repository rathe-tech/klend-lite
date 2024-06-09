import { NavLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import { VERSION } from "@misc/config";
import * as css from "./app-bar.css";

export const AppBar = () => {
  const { connected } = useWallet();

  return (
    <div className={css.appBar}>
      <div className={css.appBarBody}>
        <NavLink to="/" className={css.appTitle}>KLEND {VERSION}</NavLink>
        <div className={css.appControls}>
          {connected && <NavLink to="/donation" className={css.appDonate}>👍 Donate</NavLink>}
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
}