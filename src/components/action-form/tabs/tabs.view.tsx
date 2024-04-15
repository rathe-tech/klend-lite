import { ActionKind } from "../action-form.model";
import * as css from "./tabs.css";

const TAB_TITLE_SETTINGS = [
  { kind: ActionKind.Supply, title: "Supply", forDepositOnly: true },
  { kind: ActionKind.Withdraw, title: "Withdraw", forDepositOnly: true },
  { kind: ActionKind.Borrow, title: "Borrow", forDepositOnly: false },
  { kind: ActionKind.Repay, title: "Repay", forDepositOnly: false },
] as const;

export const Tabs = ({
  kind,
  isBorrowable,
  onClick,
}: {
  kind: ActionKind,
  isBorrowable: boolean,
  onClick: (kind: ActionKind) => void,
}) =>
  <div className={css.tabs}>
    {TAB_TITLE_SETTINGS
      .filter(x => isBorrowable || x.forDepositOnly)
      .map(x =>
        <TabItem
          key={x.kind}
          title={x.title}
          active={kind === x.kind}
          onClick={() => onClick(x.kind)}
        />
      )
    }
  </div>

const TabItem = ({
  title,
  active,
  onClick,
}: {
  title: string,
  active?: boolean,
  onClick: () => void
}) =>
  <div
    onClick={onClick}
    className={active ? css.activeItem : css.item}
  >
    {title}
  </div>