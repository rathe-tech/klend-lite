import { useCallback, useState, useEffect, useRef } from "react";

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
  const { marketInfo } = useMarket();

  const isActive = useRef(false);
  const cachedMarketInfo = useRef(marketInfo);
  const [action, setAction] = useState<Action | null>(null);

  // Prevent dialog opening if the cached market isn't equal to the active one.
  // Only a user interaction will reset the flag to open the dialog.
  if (cachedMarketInfo.current !== marketInfo) {
    cachedMarketInfo.current = marketInfo;
    isActive.current = false;
  }

  const open = useCallback((action: Action) => {
    isActive.current = true;
    setAction(action);
  }, []);
  const close = useCallback(() => setAction(null), []);

  return (
    <ActionFormContext.Provider value={{
      action: isActive.current ? action : null,
      close,
      open
    }}>
      {children}
      <ActionFormAnchor />
    </ActionFormContext.Provider>
  );
};