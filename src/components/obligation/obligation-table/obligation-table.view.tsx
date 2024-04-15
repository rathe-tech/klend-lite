import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoMarket, Position } from "@hubbleprotocol/kamino-lending-sdk";

import { PositionKind, UIPosition, usePositions } from "./obligation-table.model";
import * as css from "./obligation-table.css";
import { ActionKind, useActionForm } from "../../action-form";

export const ObligationTable = ({
  kind,
  market,
  positions,
  amount,
}: {
  kind: PositionKind,
  market: KaminoMarket,
  positions: Map<PublicKey, Position>,
  amount: string,
}) => {
  const formatted = usePositions({ market, positions });

  return (
    <table style={{ height: "100%" }}>
      <thead>
        <tr>
          <th colSpan={2}>{toTitle(kind)}</th>
          <th className={css.amount}>{amount}</th>
        </tr>
        <tr>
          <th>Asset</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {formatted.length === 0 && <NoPositionRow kind={kind} />}
        {formatted.map(position =>
          <PositionRow
            key={position.mintAddress.toBase58()}
            kind={kind}
            position={position}
          />
        )}
      </tbody>
    </table>
  );
};

function toTitle(kind: PositionKind) {
  switch (kind) {
    case PositionKind.Supplied:
      return "Supplied";
    case PositionKind.Borrowed:
      return "Borrowed";
    default:
      throw new Error(`Not supported position kind: ${kind}`);
  }
}

const NoPositionRow = ({ kind }: { kind: PositionKind }) => {
  const text = useMemo(() => {
    switch (kind) {
      case PositionKind.Borrowed:
        return "You have no borrows";
      case PositionKind.Supplied:
        return "You have no deposits";
      default:
        throw new Error(`Unknown position kind ${kind}`);
    }
  }, [kind]);

  return (
    <tr className={css.noPosition}>
      <td colSpan={3} className={css.noPositionText}>
        {text}
      </td>
    </tr>
  );
};

const PositionRow = ({ kind, position }: { kind: PositionKind, position: UIPosition }) =>
  <tr>
    <td className={css.symbol}>{position.symbol}</td>
    <td>{position.amount}</td>
    <td>
      <PositionControls kind={kind} position={position} />
    </td>
  </tr>

const PositionControls = ({ kind, position }: { kind: PositionKind, position: UIPosition }) => {
  switch (kind) {
    case PositionKind.Borrowed:
      return <BorrowControls position={position} />;
    case PositionKind.Supplied:
      return <DepositControls position={position} />;
    default:
      throw new Error(`Unknown position kind ${kind}`);
  }
};

const DepositControls = ({ position }: { position: UIPosition }) => {
  const { mintAddress, isBorrowable } = position;
  const { open } = useActionForm();

  return (
    <div className={css.controls}>
      <button onClick={() => open({ kind: ActionKind.Supply, mintAddress, isBorrowable })}>Supply</button>
      <button onClick={() => open({ kind: ActionKind.Withdraw, mintAddress, isBorrowable })}>Withdraw</button>
    </div>
  );
}

const BorrowControls = ({ position }: { position: UIPosition }) => {
  const { mintAddress, isBorrowable } = position;
  const { open } = useActionForm();

  return (
    <div className={css.controls}>
      <button onClick={() => open({ kind: ActionKind.Borrow, mintAddress, isBorrowable })}>Borrow</button>
      <button onClick={() => open({ kind: ActionKind.Repay, mintAddress, isBorrowable })}>Repay</button>
    </div>
  );
};