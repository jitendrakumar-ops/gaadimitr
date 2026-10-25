import { MMKV } from 'react-native-mmkv';

// Polyfill for React Native 0.85+ New Architecture where nativeCallSyncHook was removed
const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
if (globalObj && typeof globalObj.nativeCallSyncHook === 'undefined') {
  globalObj.nativeCallSyncHook = () => {};
}

// Initialize root MMKV instance with safe fallback
let mmkvInstance: MMKV | null = null;
try {
  mmkvInstance = new MMKV({
    id: 'gaadimitra-storage',
  });
  console.log('✅ MMKV initialized successfully!');
} catch (e) {
  console.warn('MMKV initialization failed, using in-memory fallback:', e);
}

// Fallback in-memory map if native MMKV fails
const memoryFallback = new Map<string, string>();

export const storageService = {
  setString: (key: string, value: string): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.set(key, value);
        return;
      }
    } catch {
      // Ignored
    }
    memoryFallback.set(key, value);
  },

  getString: (key: string): string | undefined => {
    try {
      if (mmkvInstance) {
        return mmkvInstance.getString(key);
      }
    } catch {
      // Ignored
    }
    return memoryFallback.get(key);
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
    try {
      if (mmkvInstance) {
        mmkvInstance.delete(key);
        return;
      }
    } catch {
      // Ignored
    }
    memoryFallback.delete(key);
  },

  clearAll: (): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
        return;
      }
    } catch {
      // Ignored
    }
    memoryFallback.clear();
  },
};
