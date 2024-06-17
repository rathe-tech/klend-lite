import { NavLink, useLocation } from "react-router-dom";
import { MarketInfo } from "@misc/config";
import { Section } from "../section";
import * as css from "./market-select.css";

export const MarketSelect = () =>
  <Section.Header>
    <div className={css.marketList}>
      {MarketInfo.KNOWN_MARKETS.map((market) =>
        <MarketItem
          key={market.address.toBase58()}
          {...market}
        />
      )}
    </div>
  </Section.Header>

const MarketItem = ({ name, address, main }: MarketInfo) => {
  const { pathname } = useLocation();
  const link = `/market/${address}`;

  return (
    <NavLink
      to={main ? "/" : link}
      className={({ isActive }) =>
        isActive || pathname.includes(link) ? css.marketItemActive : css.marketItem}
    >
      {name}
    </NavLink>
  );
};