import Decimal from "decimal.js";

export module Option {
  /**
   * Performs a value check against null or undefined. If the value is not null or undefined returns it.
   * @param value A value to unwrap to a given <T> type.
   * @param message A message to throw if the given value is null or undefined.
   * @returns The unwrapped value.
   */
  export function unwrap<T>(value: T | null | undefined, message = "Value is null or undefined"): T {
    if (value == null) {
      throw new Error(message);
    }
    return value;
  }
}

export module Assert {
  /**
   * Asserts a value is not null or undefined.
   * @param value A possible null or undefined value to check.
   * @param message A message to throw if the value is none.
   */
  export function some<T>(value: T | null | undefined, message = "Value is null or undefined"): asserts value is T {
    if (value == null) {
      throw new Error(message);
    }
  }

  /**
   * Asserts a value is true.
   * @param value A value to check.
   * @param message A message to throw if the value is false.
   */
  export function ok(value: boolean, message = "Value is false"): asserts value is true {
    if (!value) {
      throw new Error(message);
    }
  }
}

export module MapUtils {
  export function findUnusedKeys<K, V>(newMap: Map<K, V>, oldMap: Map<K, V>) {
    return [...oldMap.keys()].filter(k => !newMap.has(k));
  }
}

export module UIUtils {
  export function toUINumber(value: Decimal, decimals: number) {
    return value.div(10 ** decimals).toDecimalPlaces(decimals).toString();
  }

  export function toPercent(value: number, decimalPlaces: number) {
    return `${(value * 100).toFixed(decimalPlaces)}%`;
  }

  export function toFormattedPercent(value: Decimal | undefined) {
    return value ? UIUtils.toPercent(value.toNumber(), 4) : "-";
  }

  export function toFormattedUsd(value: Decimal | undefined) {
    return value ? `$${value.toDecimalPlaces(2).toString()}` : "-";
  }

  export function toNativeNumber(value: number | string, decimals: number) {
    return new Decimal(value)
      .toDecimalPlaces(decimals)
      .mul(10 ** decimals)
      .floor();
  }
}