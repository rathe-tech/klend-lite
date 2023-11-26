export class IndexedArray<TValue> {
  #array: TValue[];
  #indices: Map<string | number, number>;

  public constructor(array: TValue[], keySelector: (item: TValue) => string | number) {
    this.#array = array;
    this.#indices = new Map(this.#array.map((x, i) => [keySelector(x), i]));
  }

  public getByKey(value: string | number) {
    const index = this.#indices.get(value);
    if (index != null) {
      return this.#array[index];
    }
  }

  public getArray() {
    return this.#array as readonly TValue[];
  }
}