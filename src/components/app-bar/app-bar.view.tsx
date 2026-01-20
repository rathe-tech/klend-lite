import { NavLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import { useSettings } from "@components/settings-context";
import { Section } from "@components/section";

import { UIUtils } from "@misc/utils";
import { VERSION } from "@misc/config";
import * as css from "./app-bar.css";

export const AppBar = () => {
  const { connected } = useWallet();

  return (
    <Section.Header>
      <div className={css.appBar}>
        <NavLink to="/" className={css.appTitle}>KLEND {VERSION}</NavLink>
        <div className={css.appControls}>
          {connected && <NavLink to="/donation" className={css.appDonate}>👍 Donate</NavLink>}
          {connected && <SettingsButton />}
          <WalletMultiButton />
        </div>
      </div>
    </Section.Header>
  );
}

const SettingsButton = () => {
  const { priorityFee, open } = useSettings();

  return (
    <button onClick={open}>
      <span className={css.paledText}>Priority: </span>
      {UIUtils.toUINumber(priorityFee, 9)} SOL
    </button>
  );
}