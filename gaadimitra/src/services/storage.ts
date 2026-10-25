import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';

// Safe interface for localStorage if running in Chrome DevTools / Remote JS Debugger
interface StorageLike {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

const getLocalStorage = (): StorageLike | null => {
  try {
    const g = globalThis as any;
    if (typeof g.localStorage !== 'undefined' && g.localStorage !== null) {
      return g.localStorage as StorageLike;
    }
  } catch {
    // Ignore
  }
  return null;
};

// Initialize root MMKV instance with safe fallback
let mmkvInstance: MMKV | null = null;
try {
  mmkvInstance = new MMKV({
    id: 'gaadimitra-storage',
  });
} catch (e) {
  // MMKV cannot be used in Chrome Remote Debugger because JSI is disabled
  if (__DEV__) {
    console.log('MMKV native JSI unavailable (Remote Debugger active). Using AsyncStorage + localStorage persistence.');
  }
}

// In-memory synchronous cache Map
const memoryCache = new Map<string, string>();

// 1. Immediately hydrate from localStorage (sync in Chrome Remote Debugger)
const browserStorage = getLocalStorage();
if (browserStorage) {
  try {
    for (let i = 0; i < browserStorage.length; i++) {
      const key = browserStorage.key(i);
      if (key) {
        const val = browserStorage.getItem(key);
        if (val !== null) {
          memoryCache.set(key, val);
        }
      }
    }
  } catch (e) {
    // Ignored
  }
}

// 2. Hydrate from MMKV (sync in native JSI mode)
if (mmkvInstance) {
  try {
    const keys = mmkvInstance.getAllKeys();
    for (const key of keys) {
      const val = mmkvInstance.getString(key);
      if (val !== undefined) {
        memoryCache.set(key, val);
      }
    }
  } catch (e) {
    // Ignored
  }
}

// 3. Hydrate from AsyncStorage (persists across Android native restarts)
let isReady = false;
const readyPromise = (async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (keys && keys.length > 0) {
      const records = await AsyncStorage.getMany(keys);
      for (const [k, v] of Object.entries(records)) {
        if (v !== null) {
          memoryCache.set(k, v);
          // Sync to localStorage as well if in remote debugger
          if (browserStorage) {
            try {
              browserStorage.setItem(k, v);
            } catch {}
          }
        }
      }
    }
  } catch (e) {
    // Ignored
  } finally {
    isReady = true;
  }
})();

export const storageService = {
  /**
   * Wait for storage to be fully hydrated from disk
   */
  ready: async (): Promise<void> => {
    if (isReady) return;
    await readyPromise;
  },

  setString: (key: string, value: string): void => {
    memoryCache.set(key, value);

    // Save to MMKV if available
    try {
      if (mmkvInstance) {
        mmkvInstance.set(key, value);
      }
    } catch {}

    // Save to localStorage if available (Chrome Remote Debugger)
    try {
      if (browserStorage) {
        browserStorage.setItem(key, value);
      }
    } catch {}

    // Save to AsyncStorage (Native Android Disk)
    AsyncStorage.setItem(key, value).catch(() => {});
  },

  getString: (key: string): string | undefined => {
    // Check in-memory cache first (fastest)
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }

    // Check MMKV
    try {
      if (mmkvInstance) {
        const val = mmkvInstance.getString(key);
        if (val !== undefined) {
          memoryCache.set(key, val);
          return val;
        }
      }
    } catch {}

    // Check localStorage (Chrome Remote Debugger)
    try {
      if (browserStorage) {
        const val = browserStorage.getItem(key);
        if (val !== null) {
          memoryCache.set(key, val);
          return val;
        }
      }
    } catch {}

    return undefined;
  },

  setObject: <T>(key: string, value: T): void => {
    try {
      const json = JSON.stringify(value);
      storageService.setString(key, json);
    } catch (e) {
      console.warn('Failed to save object to storage:', e);
    }
  },

  getObject: <T>(key: string): T | null => {
    try {
      const json = storageService.getString(key);
      if (json) {
        return JSON.parse(json) as T;
      }
    } catch (e) {
      console.warn('Failed to parse object from storage:', e);
    }
    return null;
  },

  delete: (key: string): void => {
    memoryCache.delete(key);

    try {
      if (mmkvInstance) {
        mmkvInstance.delete(key);
      }
    } catch {}

    try {
      if (browserStorage) {
        browserStorage.removeItem(key);
      }
    } catch {}

    AsyncStorage.removeItem(key).catch(() => {});
  },

  clearAll: (): void => {
    memoryCache.clear();

    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
      }
    } catch {}

    try {
      if (browserStorage) {
        browserStorage.clear();
      }
    } catch {}

    AsyncStorage.clear().catch(() => {});
  },
};
