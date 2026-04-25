const STALE_MS = 30_000;
const lastFetchMap: Record<string, number> = {};

export function shouldRefetch(key: string): boolean {
  const last = lastFetchMap[key] ?? 0;
  const now = Date.now();
  if (now - last < STALE_MS) return false;
  lastFetchMap[key] = now;
  return true;
}

export function invalidateFetch(key: string): void {
  delete lastFetchMap[key];
}
