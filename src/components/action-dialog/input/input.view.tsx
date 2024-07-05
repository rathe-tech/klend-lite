import Decimal from "decimal.js";
import { useMemo, useRef } from "react";
import { usdFormatter } from "@misc/utils";
import * as css from "./input.css";

export const Input = ({
  value,
  symbol,
  decimals,
  price,
  onChange,
}: {
  value: string,
  symbol: string,
  decimals: number,
  price: Decimal,
  onChange: (value: string) => void,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const step = useMemo(() => 1 / (10 ** decimals), [decimals]);
  const amount = price.mul(value ? Number.parseFloat(value) : 0);

  return (
    <div
      className={css.root}
      onClick={() => inputRef.current?.focus()}
    >
      <div className={css.buttonWrapper} />
      <div className={css.inputWrapper}>
        <div className={css.mainLine}>
          <input
            autoFocus ref={inputRef}
            type="number"
            className={css.input}
            placeholder="0"
            min="0"
            step={step}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <div className={css.symbol}>
            {symbol}
          </div>
        </div>
        <div className={css.auxLine}>
          ≈ ${usdFormatter.format(amount.toNumber())}
        </div>
      </div>
    </div>
  );
};