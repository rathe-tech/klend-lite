import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { useSettings } from "./settings-context";

export const RpcConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { rpcUrl } = useSettings();

  return (
    <ConnectionProvider
      endpoint={rpcUrl}
      config={{ commitment: "confirmed" }}
    >
      {children}
    </ConnectionProvider>
  );
};