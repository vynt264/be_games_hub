function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCycler<T>(items: T[]) {
  if (!items || items.length === 0) {
    throw new Error("createCycler: items must be non-empty");
  }
  let pool = shuffle(items);
  return () => {
    if (pool.length === 0) pool = shuffle(items);
    return pool.pop()!;
  };
}

function noConsecutive<T>(picker: () => T, maxAttempts = 6) {
  let prev: T | undefined = undefined;
  return () => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const p = picker();
      if (p !== prev || attempt === maxAttempts - 1) {
        prev = p;
        return p;
      }
      attempt++;
    }
    return prev as T;
  };
}

export function makePicker<T>(items: T[]) {
  return noConsecutive(createCycler(items));
}

export function distributeTotalRandomly(
  total: number,
  parts: number,
): number[] {
  const min = 0.1;
  if (parts <= 0) return [];

  const base = Array(parts).fill(min);
  const minSum = parts * min;

  if (total <= minSum) {
    return base;
  }

  const remainder = total - minSum;
  const weights: number[] = Array.from({ length: parts }, () => Math.random());
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;
  const distributed = weights.map((w) => (w / wsum) * remainder);
  const result = base.map((b, i) => b + distributed[i]);

  const sum = result.reduce((a, b) => a + b, 0);
  const diff = total - sum;
  result[parts - 1] += diff;
  if (result[parts - 1] < min) {
    let needed = min - result[parts - 1];
    result[parts - 1] = min;
    for (let i = 0; i < parts - 1 && needed > 0; i++) {
      const avail = result[i] - min;
      if (avail <= 0) continue;
      const take = Math.min(avail, needed);
      result[i] -= take;
      needed -= take;
    }
  }
  return result;
}
