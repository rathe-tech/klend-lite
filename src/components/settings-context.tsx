import Decimal from "decimal.js";
import { createContext, useContext } from "react";

export interface SettingsContext {
  priorityFee?: Decimal;
}

const SettingsContext = createContext<SettingsContext | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const priorityFee = loadPriorityFee();

  return (
    <SettingsContext.Provider value={{ priorityFee }}>
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