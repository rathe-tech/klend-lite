import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Store } from "./__legacy/models";
import { App } from "./__legacy/app";

type WalletState =
  | { tag: "Connected", publicKey: PublicKey }
  | { tag: "Disconnected" }
  | { tag: "Connecting" }
  | { tag: "Disconnecting" };

const WALLET_STATE_DISCONNECTED: WalletState = { tag: "Disconnected" };
const WALLET_STATE_CONNECTING: WalletState = { tag: "Disconnecting" };
const WALLET_STATE_DISCONNECTING: WalletState = { tag: "Disconnecting" };

const useWalletConnect = () => {
  const { connection } = useConnection();
  const { connected, connecting, disconnecting, publicKey, signTransaction, sendTransaction } = useWallet();
  const [walletState, setWalletState] = React.useState<WalletState>(WALLET_STATE_DISCONNECTED);

  React.useEffect(() => {
    if (connecting && walletState.tag !== "Connecting") {
      console.log("Wallet Connecting...");
      setWalletState(WALLET_STATE_CONNECTING);
    } else if (disconnecting && walletState.tag !== "Disconnecting") {
      console.log("Wallet Disconnecting...");
      setWalletState(WALLET_STATE_DISCONNECTING);
    } else if (connected) {
      if (publicKey == null) throw new Error("Connected wallet must have public key");

      // It can be a new connection or a wallet change.
      if (walletState.tag !== "Connected") {
        console.log("Wallet Connected %s: ", publicKey.toBase58());
        setWalletState({ tag: "Connected", publicKey });
        document.dispatchEvent(new CustomEvent("legacy:connect", {
          detail: {
            publicKey,
            connection,
            signTransaction,
            sendTransaction
          },
          bubbles: true
        }));
      } else if (walletState.tag === "Connected" && !walletState.publicKey.equals(publicKey)) {
        console.log("Wallet Changed %s: ", publicKey.toBase58());
        setWalletState({ tag: "Connected", publicKey });
        document.dispatchEvent(new CustomEvent("legacy:connect", {
          detail: {
            publicKey,
            connection,
            signTransaction,
            sendTransaction
          },
          bubbles: true
        }));
      }
    } else if (!connected && walletState.tag !== "Disconnected") {
      console.log("Wallet Disconnected");
      setWalletState(WALLET_STATE_DISCONNECTED);
      document.dispatchEvent(new CustomEvent("legacy:disconnect", {
        bubbles: true
      }));
    }
  }, [connected, connecting, disconnecting, publicKey]);

  return walletState;
};

export const Legacy = () => {
  const containerRef = React.useRef(null);
  const legacyAppRef = React.useRef<App | null>(null);

  useWalletConnect();

  React.useEffect(() => {
    if (legacyAppRef.current == null) {
      const store = new Store();
      const app = new App(store);

      app.mount(containerRef.current!);
      store.refresh();

      legacyAppRef.current = app;
    }
  }, []);

  return (
    <div ref={containerRef} />
  );
};