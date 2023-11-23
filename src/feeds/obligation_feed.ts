import { Connection, PublicKey } from "@solana/web3.js";
import { KaminoMarket, KaminoObligation } from "@hubbleprotocol/kamino-lending-sdk";
import { Feed } from "./feed";

export class ObligationFeed extends Feed<KaminoObligation | null> {
  #wallet: PublicKey | null;
  #market: KaminoMarket | null;

  public set wallet(value: PublicKey | null) {
    this.#wallet = value;
    this.refresh();
  }

  public set market(value: KaminoMarket | null) {
    this.#market = value;
    this.refresh();
  }

  public constructor(connection: Connection) {
    super(connection);
    this.#wallet = null;
    this.#market = null;
  }

  protected override async onRefresh(): Promise<KaminoObligation | null> {
    if (this.#wallet == null) {
      return null;
    }
    if (this.#market == null) {
      return null;
    }

    const obligations = await this.#market.getAllUserObligations(this.#wallet);
    return obligations.length !== 0 ? obligations[0] : null;
  }
}