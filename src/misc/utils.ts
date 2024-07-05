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

export module ArrayUtils {
  export function unionWithScalar<T>(array: T[], value: T, tail: boolean = true) {
    return tail ? [...array, value] : [value, ...array];
  }

  export function replaceAt<T>(array: T[], index: number, newValue: T): T[] {
    return [...array.slice(0, index), newValue, ...array.slice(index + 1)];
  }

  export function removeAt<T>(array: T[], index: number) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
}

export module Simulation {
  export async function wait(ms: number) {
    return await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  }
}

export module UIPercent {
  export function fromDecimalFraction(value: Decimal | undefined, decimalPlaces: number = 4) {
    return fromNumberFraction(value ? value.toNumber() : value, decimalPlaces);
  }

  export function fromNumberFraction(value: number | undefined, decimalPlaces: number = 4) {
    if (value == null) {
      return "-";
    } else if (value === 0) {
      return "0%"
    } else {
      return `${(value * 100).toFixed(decimalPlaces)}%`;
    }
  }
}

export module TokenAmount {
  export function toNative(value: string | undefined, decimals: number): Decimal | undefined {
    if (value == null || value === "") return;

    return new Decimal(value)
      .toDecimalPlaces(decimals)
      .mul(10 ** decimals)
      .floor();
  }
}

export module UIUtils {
  export function toUINumber(value: Decimal, decimals: number, keepZeroes: boolean = false) {
    const rebased = value.div(10 ** decimals).toDecimalPlaces(decimals);
    return toCommaFormattedNumber(keepZeroes ? rebased.toFixed(decimals) : rebased.toString());
  }

  export function toFormattedUsd(value: Decimal | undefined) {
    return value ? `$${toCommaFormattedNumber(value.toDecimalPlaces(2).toString())}` : "-";
  }

  export function toUIPrice(price: Decimal) {
    const normalizedPrice = price.gte(1) ? price.toFixed(2) : price.toPrecision(4);
    return `$${toCommaFormattedNumber(normalizedPrice)}`;
  }

  function toCommaFormattedNumber(value: string) {
    const [whole, fraction] = value.split(".");
    const formattedWhole = [...whole].reduce((acc, letter, index) => {
      if (index !== 0 && (whole.length - index) % 3 === 0) {
        acc.push(",");
      }
      acc.push(letter);
      return acc;
    }, [] as string[]).join("");

    if (fraction != null) {
      return `${formattedWhole}.${fraction}`;
    } else {
      return formattedWhole;
    }
  }
}

export const usdFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});