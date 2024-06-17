import { NavLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import { VERSION } from "@misc/config";
import { Section } from "../section";
import * as css from "./app-bar.css";

export const AppBar = () => {
  const { connected } = useWallet();

  return (
    <Section.Header>
      <div className={css.appBar}>
        <NavLink to="/" className={css.appTitle}>KLEND {VERSION}</NavLink>
        <div className={css.appControls}>
          {connected && <NavLink to="/donation" className={css.appDonate}>👍 Donate</NavLink>}
          <WalletMultiButton />
        </div>
      </div>
    </Section.Header>
  );
}