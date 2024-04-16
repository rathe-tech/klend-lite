import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { VERSION } from "@misc/config";
import * as css from "./app-bar.css";

export const AppBar = () =>
  <div className={css.appBar}>
    <div className={css.appBarBody}>
      <div className={css.appTitle}>KLEND LITE {VERSION}</div>
      <WalletMultiButton />
    </div>
  </div>