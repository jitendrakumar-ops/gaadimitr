/**
 * Base API Client Configuration & Helpers
 * Ready for future backend integration (e.g., Axios / Fetch wrapper)
 */

export interface RequestConfig extends RequestInit {
  baseUrl?: string;
  token?: string;
  _isRetry?: boolean;
}

declare const process: {
  env: {
    API_BASE_URL?: string;
    [key: string]: string | undefined;
  };
};

// Configurable base URL (can be read from env in production)
export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.API_BASE_URL) || 'https://gaadimitraadmin.topxbet.live/api/v1';

import { storageService } from './storage';
import { isForbiddenDriverAccess, handleForbiddenAccess } from '../utils/authHandler';

export class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private onTokenRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  /**
   * Calls POST /auth/refresh-token using the saved refreshToken
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const rawRefreshToken = storageService.getString('refresh_token');
    if (!rawRefreshToken) {
      return null;
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((newToken) => {
          if (newToken) {
            resolve({
              accessToken: newToken,
              refreshToken: storageService.getString('refresh_token') || '',
            });
          } else {
            resolve(null);
          }
        });
      });
    }

    this.isRefreshing = true;

    try {
      const url = `${this.baseUrl}/auth/refresh-token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: rawRefreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (isForbiddenDriverAccess(response.status, errorData)) {
          handleForbiddenAccess(errorData?.message);
        }
        this.isRefreshing = false;
        this.onTokenRefreshed(null);
        return null;
      }

      const data = await response.json();
      const newAccessToken =
        data?.data?.accessToken ||
        data?.accessToken ||
        data?.data?.tokens?.accessToken;

      const newRefreshToken =
        data?.data?.refreshToken ||
        data?.refreshToken ||
        data?.data?.tokens?.refreshToken ||
        rawRefreshToken;

      if (newAccessToken) {
        storageService.setString('auth_token', newAccessToken);
        storageService.setString('refresh_token', newRefreshToken);
        this.isRefreshing = false;
        this.onTokenRefreshed(newAccessToken);
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }

      this.isRefreshing = false;
      this.onTokenRefreshed(null);
      return null;
    } catch (e) {
      console.warn('Failed to refresh token:', e);
      this.isRefreshing = false;
      this.onTokenRefreshed(null);
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const { baseUrl = this.baseUrl, token, headers = {}, ...rest } = options;
    const url = `${baseUrl}${endpoint}`;

    const authToken = token || storageService.getString('auth_token');
    const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;
    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers as Record<string, string>),
    };

    // if (__DEV__) {
    //   console.log(`🌐 [HTTP ${options.method || 'GET'}] ${url}`, {
    //     headers: defaultHeaders,
    //     body: isFormData ? '[FormData]' : rest.body,
    //   });
    // }

    const response = await fetch(url, {
      ...rest,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      // If 401 Unauthorized, attempt to use refresh token and retry the request once
      if (response.status === 401 && endpoint !== '/auth/refresh-token' && !options._isRetry) {
        if (__DEV__) {
          console.log('🔄 Access token expired. Attempting refresh token...');
        }
        const refreshed = await this.refreshToken();
        if (refreshed?.accessToken) {
          return this.request<T>(endpoint, {
            ...options,
            _isRetry: true,
            token: refreshed.accessToken,
          });
        }

        // If refresh token also failed, purge stored tokens
        storageService.delete('auth_token');
        storageService.delete('refresh_token');
        storageService.delete('user_data');
        storageService.delete('driver_data');
      }

      const errorData = await response.json().catch(() => ({}));
      if (__DEV__) {
        console.warn(`❌ [HTTP ${response.status}] ${url}`, errorData);
      }

      // Check if response indicates forbidden driver access (Access restricted to drivers)
      if (isForbiddenDriverAccess(response.status, errorData)) {
        handleForbiddenAccess(errorData?.message);
      }

      const error: any = new Error(errorData.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.code = errorData.code;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();

    // Check if successful HTTP status (e.g. 200) contains forbidden error payload
    if (isForbiddenDriverAccess(response.status, data)) {
      handleForbiddenAccess(data?.message);
      const error: any = new Error(data?.message || 'Forbidden: Access restricted to drivers');
      error.status = response.status;
      error.code = data?.code;
      error.data = data;
      throw error;
    }

    // if (__DEV__) {
    //   console.log(`✅ [HTTP ${response.status}] ${url}`, data);
    // }
    return data;
  }

  get<T>(endpoint: string, options?: RequestConfig) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  postFormData<T>(endpoint: string, formData: FormData, options?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }

  patchFormData<T>(endpoint: string, formData: FormData, options?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: formData,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

/**
 * Test API function that performs a real HTTP request to test Network Tab
 */
