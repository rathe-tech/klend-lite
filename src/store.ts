import { Connection } from "@solana/web3.js";
import Solflare from "@solflare-wallet/sdk";
import {
  KaminoMarket,
  KaminoObligation,
  VanillaObligation,
  PROGRAM_ID,
} from "@hubbleprotocol/kamino-lending-sdk";

import { MARKET_ADDRESS, RPC_ENDPOINT } from "./config";
import { MarketEventTag, ObligationEventTag, WalletEventTag, emit, listen } from "./events";

export class Store {
  #connection: Connection = new Connection(RPC_ENDPOINT);
  #wallet: Solflare = new Solflare({ network: "mainnet-beta" });
  #market: KaminoMarket | null = null;
  #obligation: KaminoObligation | null = null;

  #isMarketLoading = false;
  #isObligationLoading = false;

  public get connection() { return this.#connection; }
  public get wallet() { return this.#wallet; }
  public get market() { return this.#market; }
  public get obligation() { return this.#obligation; }

  public constructor() {
    this.#wallet.on("connect", () => {
      emit(WalletEventTag.Connect, {
        address: this.#wallet.publicKey!,
        context: this
      });
    });
    this.#wallet.on("disconnect", () => {
      emit(WalletEventTag.Disconnect, { context: this })
    });

    listen(WalletEventTag.Connect, async () => {
      await this.#loadMarket();
    });
    listen(WalletEventTag.Disconnect, () => {
      // Invalidate obligation if there's no active loading.
      // Otherwise it will be invalidated after the active loading is complete.
      if (!this.#isObligationLoading) {
        this.#obligation = null;
        emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
      }
      // Invalidate market if there's no active loading.
      // Otherwise it will be invalidated after the active loading is complete.
      // No need to invalidate if it's not loaded.
      if (!this.#isMarketLoading && this.#market != null) {
        emit(MarketEventTag.Loaded, { market: this.#market, context: this });
      }
    });

    listen(MarketEventTag.Loaded, async () => {
      // 1. After the market is loaded we can try to load an obligation in case the wallet is connected.
      // 2. If there's no connected wallet and no active loading presented set the current obligation
      //    to null and invalidate it.
      if (this.#wallet.isConnected) {
        await this.#loadObligation();
      } else if (!this.#isObligationLoading) {
        this.#obligation = null;
        emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
      }
    });
  }

  public async refresh() {
    await this.#loadMarket();
  }

  async #loadMarket() {
    if (this.#isMarketLoading) {
      return;
    } else {
      this.#isMarketLoading = true;
    }

    try {
      emit(MarketEventTag.Loading, { context: this });

      this.#market = await KaminoMarket.load(this.#connection, MARKET_ADDRESS);
      if (this.#market == null) throw new Error(`Could not load market: ${MARKET_ADDRESS}`);

      emit(MarketEventTag.Loaded, { market: this.#market, context: this });
    } catch (error) {
      emit(MarketEventTag.Error, { error, context: this });
    } finally {
      this.#isMarketLoading = false;
    }
  }

  async #loadObligation() {
    if (this.#isObligationLoading) {
      return;
    } else {
      this.#isObligationLoading = true;
    }

    try {
      emit(ObligationEventTag.Loading, { context: this });

      if (this.#market == null) throw new Error("Market is unavailable");
      if (this.#wallet.publicKey == null) throw new Error("Wallet isn't connected");

      this.#obligation = await this.#market.getObligationByWallet(this.#wallet.publicKey, new VanillaObligation(PROGRAM_ID));

      emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
    } catch (error) {
      emit(ObligationEventTag.Error, { error, context: this });
    } finally {
      this.#isObligationLoading = false;
    }
  }
}