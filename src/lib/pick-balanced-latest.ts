/**
 * Lấy tối đa `limit` phần tử (ưu tiên 1: đủ số).
 * Với mỗi vòng lấy 1 phần tử / nhóm theo `keyOrder` (ưu tiên 2: đều category).
 * `items` đã sắp mới → cũ; mỗi nhóm lấy phần tử còn lại đầu tiên (mới nhất).
 */
export function pickBalancedLatest<T>(
  items: T[],
  limit: number,
  getKey: (item: T) => string,
  keyOrder?: readonly string[],
): T[] {
  if (limit <= 0 || items.length === 0) return [];

  const buckets = new Map<string, T[]>();
  const seenKeys: string[] = [];

  for (const item of items) {
    const key = getKey(item);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
      seenKeys.push(key);
    }
  }

  const orderedKeys = resolveKeyOrder(seenKeys, keyOrder);
  const cursor = new Map(orderedKeys.map((key) => [key, 0]));
  const picked: T[] = [];

  while (picked.length < limit) {
    let added = false;
    for (const key of orderedKeys) {
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const index = cursor.get(key) ?? 0;
      if (index >= bucket.length) continue;
      const next = bucket[index];
      if (!next) continue;
      picked.push(next);
      cursor.set(key, index + 1);
      added = true;
      if (picked.length >= limit) break;
    }
    if (!added) break;
  }

  return picked;
}

function resolveKeyOrder(
  seenKeys: string[],
  keyOrder?: readonly string[],
): string[] {
  if (!keyOrder?.length) return seenKeys;

  const seen = new Set(seenKeys);
  const ordered = keyOrder.filter((key) => seen.has(key));
  for (const key of seenKeys) {
    if (!ordered.includes(key)) ordered.push(key);
  }
  return ordered;
}
