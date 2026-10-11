// ============================================================================
// P5 — CACHE                    STATUS: STUB (written by P4)
// ----------------------------------------------------------------------------
// P5: swap the Map for localStorage/IndexedDB. Keys:
//   reading:<locationId>              ttl 600s
//   insights:<locationId>:<personaKey> ttl 900s
// ============================================================================
const _mem = new Map();

export async function cacheGet(key) {
  const hit = _mem.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    _mem.delete(key);
    return null;
  }
  return hit.value;
}

export async function cacheSet(key, value, ttlSeconds = 600) {
  _mem.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheClear() {
  _mem.clear();
}
