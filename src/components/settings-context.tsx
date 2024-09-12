import Decimal from "decimal.js";
import { createContext, useCallback, useContext, useState } from "react";
import { createSettingStorage } from "@misc/setting-storage";
import { SettingsDialogLayout } from "./settings-dialog";

export interface SettingsContext {
  rpcUrl: string;
  priorityFee: Decimal;
  changePriorityFee: (value: Decimal) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SettingsContext = createContext<SettingsContext | null>(null);

const rpcUrlStorage = createSettingStorage<string>({
  key: "KLEND_RPC_URL",
  serializer: v => v,
  deserializer: v => v,
  defaultValue: "https://rpc.hellomoon.io/aef55734-29d9-4df6-847c-f5cdc8387b60",
});

const priorityFeeStorage = createSettingStorage<Decimal>({
  key: "KLEND_PRIORITY_FEE",
  serializer: v => v.toString(),
  deserializer: v => new Decimal(v),
  defaultValue: new Decimal(100_000),
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [rpcUrl, _setRpcUrl] = useState(() => rpcUrlStorage.load());
  const [priorityFee, setPriorityFee] = useState(() => priorityFeeStorage.load());
  const [isOpen, setOpen] = useState(false);

  const changePriorityFee = useCallback((value: Decimal) => {
    priorityFeeStorage.save(value);
    setPriorityFee(value);
  }, []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SettingsContext.Provider value={{ rpcUrl, priorityFee, changePriorityFee, isOpen, open, close }}>
      {children}
      <SettingsDialogLayout />
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