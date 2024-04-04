import { PublicKey } from "@solana/web3.js";
import { Option } from "../../utils";
import { ControlBase } from "../controls";
import { MARKETS, MarketInfo } from "../../config";
import * as css from "./market_select.css";

export class MarketSelect extends ControlBase<HTMLDivElement> {
  public constructor() {
    super();

    const searchParams = new URLSearchParams(window.location.search);
    const rawMarketAddress = searchParams.get("marketAddress");
    const marketAddress = rawMarketAddress ? new PublicKey(rawMarketAddress) : MARKETS[0].address;
    const foundMarket = MARKETS.find(x => x.address.equals(marketAddress));
    const marketInfo = Option.unwrap(foundMarket, "Invalid market address");

    const items = MARKETS.map(x => new MarketItem(x, marketInfo.address.equals(x.address)));
    items.forEach(x => x.mount(this.rootElem));
  }

  protected createRootElem(): HTMLDivElement {
    const root = document.createElement("div");
    root.classList.add(css.root);
    return root;
  }
}

class MarketItem extends ControlBase<HTMLAnchorElement> {
  public constructor(marketInfo: MarketInfo, active: boolean) {
    super();

    this.rootElem.text = marketInfo.name;
    this.rootElem.href = `?marketAddress=${marketInfo.address}`;
    if (active) {
      this.rootElem.classList.add(css.active);
    }
  }

  protected createRootElem(): HTMLAnchorElement {
    const root = document.createElement("a");
    root.classList.add(css.item);
    return root;
  }
}