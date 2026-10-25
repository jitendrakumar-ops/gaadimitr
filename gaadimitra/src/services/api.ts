/**
 * Base API Client Configuration & Helpers
 * Connects to GaadiMitra Express Backend (default port 5001)
 */
import { storageService } from './storage';

export interface RequestConfig extends RequestInit {
  baseUrl?: string;
  token?: string;
}

declare const process: {
  env: {
    API_BASE_URL?: string;
    [key: string]: string | undefined;
  };
};

export const DEFAULT_API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.API_BASE_URL) ||
  'http://localhost:5001/api/v1';

let currentBaseUrl = "https://gaadimitraadmin.topxbet.live/api/v1";
// let currentBaseUrl = DEFAULT_API_BASE_URL;
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

export const setApiBaseUrl = (url: string) => {
  currentBaseUrl = url;
};

export const getApiBaseUrl = () => currentBaseUrl;

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || currentBaseUrl;
  }

  async request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const baseUrl = options.baseUrl || this.baseUrl || currentBaseUrl;
    const token = options.token || storageService.getString('access_token');
    const { headers = {}, ...rest } = options;
    const url = `${baseUrl}${endpoint}`;

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const defaultHeaders: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    };

    if (__DEV__) {
      console.log(`🌐 [HTTP ${options.method || 'GET'}] ${url}`, {
        headers: defaultHeaders,
        body: rest.body,
      });
    }

    try {
      const response = await fetch(url, {
        ...rest,
        headers: defaultHeaders,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (__DEV__) {
          console.warn(`❌ [HTTP ${response.status}] ${url}`, responseData);
        }

        // If unauthorized (token expired / revoked), trigger session reset
        if (response.status === 401) {
          if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
          }
        }

        const message =
          responseData.message ||
          (responseData.errors && responseData.errors[0]?.message) ||
          `Request failed with status ${response.status}`;
        const error = new Error(message) as any;
        error.status = response.status;
        error.code = responseData.code;
        error.data = responseData;
        throw error;
      }

      if (__DEV__) {
        console.log(`✅ [HTTP ${response.status}] ${url}`, responseData);
      }
      return responseData;
    } catch (err: any) {
      if (__DEV__) {
        console.warn(`⚠️ [API Error] ${url}:`, err.message);
      }
      throw err;
    }
  }

  get<T>(endpoint: string, options?: RequestConfig) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestConfig) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestConfig) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestConfig) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  delete<T>(endpoint: string, options?: RequestConfig) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
