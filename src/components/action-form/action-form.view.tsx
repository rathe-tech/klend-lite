import { useCallback, useState, memo, useEffect } from "react";

import { useMarket } from "../market-context";
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

export const ActionFormProvider = ({ children }: { children: React.ReactNode }) => {
  const { marketState, obligationState, tokenBalancesState } = useMarket();

  const [action, setAction] = useState<Action | null>(null);
  const open = useCallback((action: Action) => setAction(action), []);
  const close = useCallback(() => setAction(null), []);

  return (
    <ActionFormContext.Provider value={{
      market: marketState.data,
      obligation: obligationState.data,
      tokenBalances: tokenBalancesState.data,
      action,
      close,
      open
    }}>
      {children}
      <ActionFormAnchor />
    </ActionFormContext.Provider>
  );
};