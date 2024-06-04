import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@kamino-finance/klend-sdk";

import { SkeletonCell } from "@components/skeleton-cell";
import { useActionDialog, ActionKind } from "@components/action-dialog";
import { EXPLORER_URL } from "@misc/config";

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
  const { active, paused } = useReserves({ marketAddress, reserves });
  const [isPausedVisible, setPausedVisible] = useState(false);

  return (
    <table>
      <ReservesColumns />
      <tbody>
        {active.map(reserve =>
          <ReserveRow
            key={reserve.address.toBase58()}
            reserve={reserve}
            isEnabled={isEnabled}
          />
        )}
      </tbody>
      {paused.length > 0 && (
        <>
          <PausedControls
            isPausedVisible={isPausedVisible}
            setPausedVisible={setPausedVisible}
          />
          {isPausedVisible && (
            <>
              <ReservesColumns />
              <tbody>
                {paused.map(reserve =>
                  <ReserveRow
                    key={reserve.address.toBase58()}
                    reserve={reserve}
                    isEnabled={isEnabled}
                  />
                )}
              </tbody>
            </>
          )}
        </>
      )}
    </table>
  );
};

const PausedControls = ({
  isPausedVisible,
  setPausedVisible,
}: {
  isPausedVisible: boolean,
  setPausedVisible: (value: boolean) => void,
}) =>
  <tbody>
    <tr className={css.pausedControlsRow}>
      <td colSpan={7}>
        <div className={css.pausedControlsWrapper}>
          <div className={css.pausedLabel}>Paused Assets:</div>
          <button onClick={() => setPausedVisible(!isPausedVisible)}>
            {isPausedVisible ? "Hide" : "Show"}
          </button>
        </div>
      </td>
    </tr>
  </tbody>

export const SkeletonReservesTable = () =>
  <table>
    <ReservesColumns />
    <tbody>
      <SkeletonReserveRow />
      <SkeletonReserveRow />
      <SkeletonReserveRow />
    </tbody>
  </table>

const ReservesColumns = () =>
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

const ReserveRow = ({ reserve, isEnabled }: { reserve: UIReserve, isEnabled: boolean }) => {
  const { open } = useActionDialog();

  return (
    <tr>
      <td>
        <a
          className={css.symbol}
          target="_blank"
          href={`${EXPLORER_URL}/account/${reserve.address}`}
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
            style={{ visibility: reserve.isSuppliable ? "initial" : "hidden" }}
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

const SkeletonReserveRow = () =>
  <tr>
    <td>
      <SkeletonCell />
    </td>
    <td>
      <SkeletonCell />
    </td>
    <td>
      <SkeletonCell />
    </td>
    <td>
      <SkeletonCell />
    </td>
    <td>
      <SkeletonCell />
    </td>
    <td>
      <SkeletonCell />
    </td>
    <td>
      <div className={css.controls}>
        <SkeletonCell />
        <SkeletonCell />
      </div>
    </td>
  </tr>