import { Connection } from "@solana/web3.js";
import Solflare from "@solflare-wallet/sdk";
import { KaminoMarket, KaminoObligation, PROGRAM_ID, VanillaObligation } from "@hubbleprotocol/kamino-lending-sdk";

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
      this.#obligation = null;
      emit(ObligationEventTag.Loaded, { obligation: this.#obligation, context: this });
    });

    listen(MarketEventTag.Loaded, async () => {
      if (this.wallet.isConnected) {
        await this.#loadObligation();
      } else {
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