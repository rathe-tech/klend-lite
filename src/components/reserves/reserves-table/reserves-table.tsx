import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@hubbleprotocol/kamino-lending-sdk";

import { useActionForm, ActionKind } from "../../action-form";
import { useReserves, UIReserve } from "./reserves-table.model";
import * as css from "./reserve-table.css";

export const ReservesTable = ({
  marketAddress,
  reserves,
  isEnabled,
}: {
  marketAddress: string,
  reserves: Map<PublicKey, KaminoReserve>,
  isEnabled: boolean,
}) => {
  const sorted = useReserves({ marketAddress, reserves });

  return (
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th>LTV / BF</th>
          <th>Current Supply</th>
          <th>Supply APY</th>
          <th>Current Borrow</th>
          <th>Borrow APY</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(reserve =>
          <ReserveRow
            key={reserve.address.toBase58()}
            reserve={reserve}
            isEnabled={isEnabled}
          />
        )}
      </tbody>
    </table>
  );
}

const ReserveRow = ({ reserve, isEnabled }: { reserve: UIReserve, isEnabled: boolean }) => {
  const { open } = useActionForm();

  return (
    <tr>
      <td>
        <a
          className={css.symbol}
          target="_blank"
          href={`https://explorer.solana.com/address/${reserve.address}`}
        >
          {reserve.symbol}
        </a>
        <div className={css.sub}>
          {reserve.price}
        </div>
      </td>
      <td>
        {reserve.ltv}
        <span className={css.delimiter}>/</span>
        {reserve.borrowFactor}
      </td>
      <td>
        <div>
          {reserve.currentSupply}
        </div>
        <div className={css.sub}>
          Max: {reserve.maxSupply}
        </div>
      </td>
      <td>{reserve.supplyApy}</td>
      <td>
        <div>
          {reserve.currentBorrow}
        </div>
        <div className={css.sub}>
          Max: {reserve.maxBorrow}
        </div>
      </td>
      <td>{reserve.borrowApy}</td>
      <td>
        <div className={css.controls}>
          <button
            disabled={!isEnabled}
            onClick={() => open({
              kind: ActionKind.Supply,
              mintAddress: reserve.mintAddress,
              isBorrowable: reserve.isBorrowable
            })}
          >
            Supply
          </button>
          <button
            style={{ visibility: reserve.isBorrowable ? "initial" : "hidden" }}
            disabled={!isEnabled}
            onClick={() => open({
              kind: ActionKind.Borrow,
              mintAddress: reserve.mintAddress,
              isBorrowable: reserve.isBorrowable
            })}
          >
            Borrow
          </button>
        </div>
      </td>
    </tr>
  );
};