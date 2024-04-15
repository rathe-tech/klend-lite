import { NavLink, useLocation } from "react-router-dom";
import { MARKETS, MarketInfo } from "../../config";
import * as css from "./market-select.css";

export const MarketSelect = () =>
  <div className={css.marketSelect}>
    <div className={css.marketSelectBody}>
      {MARKETS.map((market) =>
        <MarketItem
          key={market.address.toBase58()}
          {...market}
        />
      )}
    </div>
  </div>

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