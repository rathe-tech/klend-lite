import Decimal from "decimal.js";
import { useRef } from "react";
import * as css from "./input.css";

const formatter = new Intl.NumberFormat('en-US', {
  notation: "compact",
  compactDisplay: "short",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const Input = ({
  value,
  symbol,
  price,
  onChange,
}: {
  value: string,
  symbol: string,
  price: Decimal,
  onChange: (value: string) => void,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
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
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <div className={css.symbol}>
            {symbol}
          </div>
        </div>
        <div className={css.auxLine}>
          ≈ ${formatter.format(amount.toNumber())}
        </div>
      </div>
    </div>
  );
};