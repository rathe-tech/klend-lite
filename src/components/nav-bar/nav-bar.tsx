import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VERSION } from "../../config";
import * as css from "./nav-bar.css";

export const NavBar = () =>
  <div className={css.navBar}>
    <div className={css.navBarBody}>
      <div className={css.appTitle}>KLEND LITE {VERSION}</div>
      <WalletMultiButton />
    </div>
  </div>