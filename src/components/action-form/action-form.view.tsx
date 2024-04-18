import Decimal from "decimal.js";
import { useCallback, useState, memo, useEffect, useMemo } from "react";
import { KaminoMarket, KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";

import { Tabs } from "./tabs";
import { Panel } from "./panel";

import { ActionFormContext, Action, useActionForm } from "./action-form.model";
import * as css from "./action-form.css";

const ActionFormAnchor = () => {
  const { action, close } = useActionForm();

  if (!action) {
    return;
  }

  return (
    <ActionForm
      action={action}
      close={close}
    />
  );
};

const ActionForm = ({ action, close }: { action: Action, close: () => void }) => {
  const [kind, setKind] = useState(() => action.kind);

  useEffect(() => {
    document.body.classList.add(css.nonScroll);
    return () => {
      document.body.classList.remove(css.nonScroll);
    };
  }, []);

  return (
    <div className={css.overlay} onClick={() => close()}>
      <div className={css.form} onClick={e => e.stopPropagation()}>
        <Tabs
          kind={kind}
          isBorrowable={action.isBorrowable}
          onClick={kind => setKind(kind)}
        />
        <Panel
          kind={kind}
          mintAddress={action.mintAddress}
        />
      </div>
    </div>
  );
};

export const ActionFormProvider = ({
  market,
  obligation,
  tokenBalances,
  children
}: {
  market: KaminoMarket | null | undefined,
  obligation: KaminoObligation | null | undefined,
  tokenBalances: Map<string, Decimal> | null | undefined,
  children: React.ReactNode
}) => {
  const [action, setAction] = useState<Action | null>(null);
  const open = useCallback((action: Action) => setAction(action), []);
  const close = useCallback(() => setAction(null), []);

  return (
    <ActionFormContext.Provider value={{ market, obligation, tokenBalances, action, close, open }}>
      {children}
      <ActionFormAnchor />
    </ActionFormContext.Provider>
  );
};