import { Connection } from "@solana/web3.js";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";

import { MARKET_ADDRESS } from "../config";
import { Feed } from "./feed";

export class MarketFeed extends Feed<KaminoMarket> {
  public constructor(connection: Connection) {
    super(connection);
  }

  protected override async onRefresh(
    connection: Connection, 
    currentEntity: KaminoMarket | null
  ): Promise<KaminoMarket> {
    if (currentEntity == null) {
      const entity = await KaminoMarket.load(connection, MARKET_ADDRESS);
      if (entity == null) {
        throw new Error(`Could not load market: ${MARKET_ADDRESS}`);
      }
      return entity;
    } else {
      await currentEntity.refreshAll();
      return currentEntity;
    }
  }
}