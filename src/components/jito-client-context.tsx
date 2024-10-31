import { createContext, useContext, useMemo } from "react";
import { JitBlockEngineClient } from "@rathe/jito-block-engine-api";

interface JitoClientContext {
  jitoClient: JitBlockEngineClient;
}

const JitoClientContext = createContext<JitoClientContext | null>(null);

export const JitoClientProvider = ({ children }: { children: React.ReactNode }) => {
  const jitoClient = useMemo(() => new JitBlockEngineClient(), []);

  return (
    <JitoClientContext.Provider value={{ jitoClient }}>
      {children}
    </JitoClientContext.Provider>
  );
};

export function useJitoClient() {
  const context = useContext(JitoClientContext);
  if (context == null) {
    throw new Error("Can not use JitoClientContext outside JitoClientProvider");
  }

  return context.jitoClient;
}