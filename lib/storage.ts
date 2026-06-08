const STORAGE_VERSION = 1;

type StorageEnvelope<T> = {
  version: number;
  data: T;
};

export type StorageReadResult<T> = {
  data: T;
  writable: boolean;
};

export function readVersionedStorage<T>(
  key: string,
  fallback: T,
  migrate: (value: unknown, version: number) => T,
): StorageReadResult<T> {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return { data: fallback, writable: true };

    const parsed: unknown = JSON.parse(stored);
    if (isStorageEnvelope(parsed)) {
      return parsed.version <= STORAGE_VERSION
        ? { data: migrate(parsed.data, parsed.version), writable: true }
        : { data: fallback, writable: false };
    }
    return { data: migrate(parsed, 0), writable: true };
  } catch {
    return { data: fallback, writable: true };
  }
}

export function writeVersionedStorage<T>(key: string, data: T) {
  try {
    const envelope: StorageEnvelope<T> = { version: STORAGE_VERSION, data };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Keep the in-memory experience working when storage is unavailable.
  }
}

function isStorageEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  return (
    isRecord(value) &&
    typeof value.version === "number" &&
    Object.hasOwn(value, "data")
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
