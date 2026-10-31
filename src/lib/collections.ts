/** Adds `item` if absent, removes it if present. Returns a new array. */
export function toggleItem<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}
