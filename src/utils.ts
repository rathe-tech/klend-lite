import Decimal from "decimal.js";

export module MapUtils {
  export function findUnusedKeys<K, V>(newMap: Map<K, V>, oldMap: Map<K, V>) {
    return [...oldMap.keys()].filter(k => !newMap.has(k));
  }
}

export module UIUtils {
  export function toUINumber(value: Decimal, decimals: number) {
    return value.div(10 ** decimals).toDecimalPlaces(decimals).toString();
  }

  export function toPercent(value: number) {
    return `${(value * 100).toFixed(4)} %`;
  }

  export function toNativeNumber(value: number | string, decimals: number) {
    return new Decimal(value)
      .toDecimalPlaces(decimals)
      .mul(10 ** decimals)
      .floor();
  }
}