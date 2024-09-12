export function createSettingStorage<T>({
  key,
  defaultValue,
  serializer,
  deserializer,
}: {
  key: string,
  defaultValue: T,
  serializer: (value: T) => string,
  deserializer: (rawValue: string) => T,
}) {
  function save(value: T) {
    localStorage.setItem(key, serializer(value));
  }

  function load() {
    const rawValue = localStorage.getItem(key);
    if (rawValue == null) {
      save(defaultValue);
      return defaultValue;
    } else {
      return deserializer(rawValue);
    }
  }

  return { save, load };
}