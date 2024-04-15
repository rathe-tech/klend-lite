import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";
import { ReservesTable } from "./reserves-table";
import * as css from "./reserves.css";

export const Reserves = ({
  marketAddress,
  reserves,
  isEnabled,
}: {
  marketAddress: string,
  reserves: Map<PublicKey, KaminoReserve>,
  isEnabled: boolean,
}) =>
  <div className={css.reserves}>
    <ReservesTable
      marketAddress={marketAddress}
      reserves={reserves}
      isEnabled={isEnabled}
    />
  </div>