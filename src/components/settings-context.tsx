import Decimal from "decimal.js";
import { createContext, useCallback, useContext, useState } from "react";

export interface SettingsContext {
  priorityFee: Decimal;
  changePriorityFee: (value: Decimal) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SettingsContext = createContext<SettingsContext | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [priorityFee, setPriorityFee] = useState(() => loadPriorityFee() ?? new Decimal(0));
  const [isOpen, setOpen] = useState(false);

  const changePriorityFee = useCallback((value: Decimal) => {
    savePriorityFee(value);
    setPriorityFee(value);
  }, []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SettingsContext.Provider value={{ priorityFee, changePriorityFee, isOpen, open, close }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context == null) {
    throw new Error("Could not use SettingsContext outside SettingsProvider");
  }

  return context;
}

const PRIORITY_FEE_KEY = "priorityFee";

function loadPriorityFee() {
  const rawPriorityFee = window.localStorage.getItem(PRIORITY_FEE_KEY);
  if (rawPriorityFee != null) {
    return new Decimal(rawPriorityFee);
  }
}

function savePriorityFee(value: Decimal) {
  window.localStorage.setItem(PRIORITY_FEE_KEY, value.toString());
}