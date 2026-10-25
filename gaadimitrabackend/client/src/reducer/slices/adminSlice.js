import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

const getResponseData = (response) => {
  const body = response?.data;

  if (body?.data !== undefined) {
    return body.data;
  }

  return body ?? null;
};

const unwrapData = (value) => {
  if (value?.data !== undefined && typeof value === "object") {
    return value.data;
  }

  return value;
};

/* =========================================================
   AUTH HELPERS
========================================================= */

const getAccessTokenFromLogin = (data) => {
  return (
    data?.accessToken ||
    data?.access_token ||
    data?.token ||
    data?.tokens?.accessToken ||
    data?.tokens?.access_token ||
    data?.auth?.accessToken ||
    data?.auth?.access_token ||
    null
  );
};

const getRefreshTokenFromLogin = (data) => {
  return (
    data?.refreshToken ||
    data?.refresh_token ||
    data?.tokens?.refreshToken ||
    data?.tokens?.refresh_token ||
    data?.auth?.refreshToken ||
    data?.auth?.refresh_token ||
    null
  );
};

const getAdminFromLogin = (data) => {
  return data?.admin || data?.user || data?.account || data?.profile || null;
};

const getAdminIdFromLogin = (data) => {
  const admin = getAdminFromLogin(data);

  return (
    data?.adminId ||
    data?.admin_id ||
    data?.userId ||
    data?.user_id ||
    data?.accountId ||
    data?.account_id ||
    admin?._id ||
    admin?.id ||
    null
  );
};

/* =========================================================
   API TOKEN HELPERS
========================================================= */

const setAdminAccessToken = (token) => {
  if (!token) {
    return;
  }

  adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const clearAdminAccessToken = () => {
  delete adminApi.defaults.headers.common.Authorization;
};

/* =========================================================
   SESSION STORAGE PERSISTENCE

   Backend requires refreshToken in the request BODY on
   /admin/auth/refresh-token (no httpOnly cookie support, and
   it isn't being changed), so it has to live in SOME browser
   storage — otherwise a page refresh wipes Redux state and
   there is nothing left to send.

   sessionStorage is used instead of localStorage:
   - survives a page refresh/reload (fixes the logout bug)
   - auto-clears the moment the tab/browser is closed, unlike
     localStorage which persists indefinitely until cleared
   - NOT shared across tabs (each tab needs its own login)

   This does NOT fully remove XSS exposure — only a backend
   httpOnly cookie can do that. If the backend is ever able to
   support cookies later, switch back to that approach.
========================================================= */

const ADMIN_SESSION_STORAGE_KEY = "adminAuthSession";

const saveSessionToStorage = ({ adminId, accessToken, refreshToken }) => {
  try {
    const existing = loadSessionFromStorage() || {};

    const payload = {
      adminId: adminId ?? existing.adminId ?? null,
      accessToken: accessToken ?? existing.accessToken ?? null,
      refreshToken: refreshToken ?? existing.refreshToken ?? null,
    };

    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // sessionStorage blocked/unavailable — fail silently
  }
};

const loadSessionFromStorage = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const clearSessionFromStorage = () => {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  accounts: [],
  selectedAccount: null,

  totalAccounts: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,

  filters: {
    role: "",
    isActive: "",
    isBlocked: "",
    search: "",
  },

  admin: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  /*
   * authChecked: false until we've tried to restore a session
   * from sessionStorage on app load. PrivateRoute must wait on
   * this before redirecting — otherwise a refresh briefly looks
   * "logged out" for one render and kicks the admin out.
   */
  authChecked: false,
  authLoading: false,

  loading: false,
  accountsLoading: false,
  accountLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  otpLoading: false,
  loginLoading: false,
  logoutLoading: false,
  refreshLoading: false,

  // Push Notifications state
  notifications: [],
  notificationsTotal: 0,
  notificationsPage: 1,
  notificationsTotalPages: 1,
  notificationsLimit: 10,
  notificationsLoading: false,
  notificationsError: null,

  sendNotificationLoading: false,
  sendNotificationError: null,
  sendNotificationSuccess: false,
  lastSentNotificationResult: null,

  // Dashboard Overview state
  overview: null,
  overviewLoading: false,
  overviewError: null,

  success: false,
  message: null,
  error: null,
};

/* =========================================================
   CREATE ACCOUNT
========================================================= */

export const createAdminAccount = createAsyncThunk(
  "admin/createAccount",
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/admin/accounts", accountData);

      return {
        data: getResponseData(response),
        message: response?.data?.message || "Account created successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   UPDATE ACCOUNT
========================================================= */

export const updateAdminAccount = createAsyncThunk(
  "admin/updateAccount",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.patch(`/admin/accounts/${id}`, data);

      return {
        id,
        data: getResponseData(response),
        message: response?.data?.message || "Account updated successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   DELETE ACCOUNT
========================================================= */

export const deleteAdminAccount = createAsyncThunk(
  "admin/deleteAccount",
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.delete(`/admin/accounts/${id}`);

      return {
        id,
        message: response?.data?.message || "Account deleted successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   GET ALL ACCOUNTS
========================================================= */

export const getAdminAccounts = createAsyncThunk(
  "admin/getAccounts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/admin/accounts", {
        params: {
          role: params.role || undefined,
          isActive:
            params.isActive !== "" && params.isActive !== undefined
              ? params.isActive
              : undefined,
          isBlocked:
            params.isBlocked !== "" && params.isBlocked !== undefined
              ? params.isBlocked
              : undefined,
          search: params.search?.trim() || undefined,
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
        },
      });

      const body = response?.data || {};
      const data = body?.data ?? body;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.accounts)
            ? data.accounts
            : Array.isArray(data?.result)
              ? data.result
              : [];

      const pagination =
        data?.pagination || data?.meta || body?.pagination || body?.meta || {};

      return {
        items,
        total: Number(pagination?.total ?? data?.total ?? body?.total ?? 0),
        page: Number(
          pagination?.page ?? data?.page ?? body?.page ?? params.page ?? 1,
        ),
        limit: Number(
          pagination?.limit ?? data?.limit ?? body?.limit ?? params.limit ?? 10,
        ),
        totalPages: Number(
          pagination?.totalPages ??
            pagination?.total_pages ??
            data?.totalPages ??
            data?.total_pages ??
            body?.totalPages ??
            body?.total_pages ??
            1,
        ),
        message: body?.message || "Accounts fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   GET ACCOUNT BY ID
========================================================= */

export const getAdminAccountById = createAsyncThunk(
  "admin/getAccountById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error("Admin account ID is required");
      }

      const response = await adminApi.get(`/admin/accounts/${id}`);

      const responseData = getResponseData(response);
      const account = unwrapData(responseData);

      return {
        data: account,
        message: response?.data?.message || "Account fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   SEND LOGIN OTP
========================================================= */

export const sendAdminLoginOtp = createAsyncThunk(
  "admin/sendLoginOtp",
  async (phone, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/admin/auth/send-otp", { phone });

      return {
        data: getResponseData(response),
        message: response?.data?.message || "OTP sent successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   ADMIN LOGIN
   POST /api/v1/admin/auth/login

   IMPORTANT FLOW:

   1. Login
   2. Get JWT (accessToken + refreshToken, both from body —
      backend doesn't set a cookie)
   3. Attach accessToken to adminApi
   4. Get admin ID
   5. GET /admin/accounts/:id
   6. Store complete admin in Redux + persist to sessionStorage
      (so a page refresh has something to restore from)
========================================================= */

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (
    { phone, otp, deviceToken = "", platform = "web" },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await adminApi.post("/admin/auth/login", {
        phone,
        otp,
        deviceToken,
        platform,
      });

      let loginData = getResponseData(response);
      loginData = unwrapData(loginData);

      const accessToken = getAccessTokenFromLogin(loginData);
      const refreshToken = getRefreshTokenFromLogin(loginData);

      const adminFromLogin = getAdminFromLogin(loginData);
      const adminId = getAdminIdFromLogin(loginData);

      if (!accessToken) {
        throw new Error("Access token was not returned by login API");
      }

      if (!refreshToken) {
        throw new Error("Refresh token was not returned by login API");
      }

      if (!adminId) {
        throw new Error("Admin ID was not returned by login API");
      }

      setAdminAccessToken(accessToken);

      const adminResult = await dispatch(getAdminAccountById(adminId)).unwrap();
      const completeAdmin = adminResult?.data || adminFromLogin || null;

      return {
        data: {
          admin: completeAdmin,
          adminId,
          accessToken,
          refreshToken,
        },
        message: response?.data?.message || "Admin login successful",
      };
    } catch (error) {
      clearAdminAccessToken();
      return rejectWithValue(error?.message || getErrorMessage(error));
    }
  },
);

/* =========================================================
   CHECK ADMIN AUTH (run once on app load / after a refresh)

   Reads the refreshToken from sessionStorage and sends it in
   the request body — matches exactly what the backend's
   /admin/auth/refresh-token route (and its validator) expects.
   This is what restores the session after a page refresh.
========================================================= */

export const checkAdminAuth = createAsyncThunk(
  "admin/checkAuth",
  async (_, { dispatch, rejectWithValue }) => {
    const stored = loadSessionFromStorage();

    if (!stored?.refreshToken || !stored?.adminId) {
      return rejectWithValue("No stored session found");
    }

    try {
      const response = await adminApi.post("/admin/auth/refresh-token", {
        refreshToken: stored.refreshToken,
      });

      let tokenData = getResponseData(response);
      tokenData = unwrapData(tokenData);

      const newAccessToken = getAccessTokenFromLogin(tokenData);
      const newRefreshToken =
        getRefreshTokenFromLogin(tokenData) || stored.refreshToken;

      if (!newAccessToken) {
        throw new Error("New access token was not returned");
      }

      setAdminAccessToken(newAccessToken);

      const adminResult = await dispatch(
        getAdminAccountById(stored.adminId),
      ).unwrap();

      return {
        data: {
          admin: adminResult?.data || null,
          adminId: stored.adminId,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      clearAdminAccessToken();
      clearSessionFromStorage();
      return rejectWithValue(error?.message || getErrorMessage(error));
    }
  },
);

/* =========================================================
   REFRESH ADMIN TOKENS (manual/interceptor-triggered refresh
   mid-session, e.g. on a 401 from an expired access token)
========================================================= */

export const refreshAdminTokens = createAsyncThunk(
  "admin/refreshTokens",
  async (refreshTokenArg, { rejectWithValue, getState }) => {
    try {
      const stored = loadSessionFromStorage();

      const tokenToUse =
        refreshTokenArg ||
        getState()?.admin?.refreshToken ||
        stored?.refreshToken;

      if (!tokenToUse) {
        throw new Error("Refresh token is missing");
      }

      const response = await adminApi.post("/admin/auth/refresh-token", {
        refreshToken: tokenToUse,
      });

      let tokenData = getResponseData(response);
      tokenData = unwrapData(tokenData);

      const newAccessToken = getAccessTokenFromLogin(tokenData);
      const newRefreshToken = getRefreshTokenFromLogin(tokenData);

      if (!newAccessToken) {
        throw new Error("New access token was not returned");
      }

      setAdminAccessToken(newAccessToken);

      return {
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || tokenToUse,
        },
        message: response?.data?.message || "Tokens refreshed successfully",
      };
    } catch (error) {
      clearAdminAccessToken();
      clearSessionFromStorage();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   ADMIN LOGOUT
========================================================= */

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/admin/auth/logout");

      return {
        message: response?.data?.message || "Logged out successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   SEND PUSH NOTIFICATION
   POST /admin/notifications/send
========================================================= */

export const sendPushNotification = createAsyncThunk(
  "admin/sendPushNotification",
  async (notificationPayload, { rejectWithValue }) => {
    try {
      const response = await adminApi.post(
        "/admin/notifications/send",
        notificationPayload,
      );

      return {
        data: getResponseData(response),
        message:
          response?.data?.message || "Push notification sent successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   GET ADMIN NOTIFICATIONS
   GET /admin/notifications
========================================================= */

export const getAdminNotifications = createAsyncThunk(
  "admin/getAdminNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = {};
      if (params.page !== undefined && params.page !== "") {
        queryParams.page = String(params.page);
      }
      if (params.limit !== undefined && params.limit !== "") {
        queryParams.limit = String(params.limit);
      }
      if (params.search?.trim()) {
        queryParams.search = params.search.trim();
      }
      if (params.type && params.type !== "all") {
        queryParams.type = params.type;
      }
      if (
        params.isRead !== undefined &&
        params.isRead !== "all" &&
        params.isRead !== ""
      ) {
        queryParams.isRead = String(params.isRead);
      }

      const response = await adminApi.get("/admin/notifications", {
        params: queryParams,
      });

      const body = response?.data || {};
      const data = body?.data ?? body;

      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      const pagination = data?.pagination || body?.pagination || {};

      return {
        items,
        total: Number(pagination?.total ?? items.length),
        page: Number(pagination?.page ?? params.page ?? 1),
        limit: Number(pagination?.limit ?? params.limit ?? 10),
        totalPages: Number(
          pagination?.totalPages ??
            Math.max(
              1,
              Math.ceil(
                (pagination?.total ?? items.length) / (pagination?.limit ?? 10),
              ),
            ),
        ),
        message: body?.message || "Notifications fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   GET ADMIN OVERVIEW (DASHBOARD)
========================================================= */

export const getAdminOverview = createAsyncThunk(
  "admin/getOverview",
  async (range = "30day", { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/admin/overview", {
        params: { range },
      });

      const responseData = getResponseData(response);
      const overview = unwrapData(responseData);

      return {
        data: overview,
        message:
          response?.data?.message || "Dashboard overview fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const adminSlice = createSlice({
  name: "admin",
  initialState,

  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },

    clearAdminSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    clearSelectedAccount: (state) => {
      state.selectedAccount = null;
    },

    setAdminFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearAdminFilters: (state) => {
      state.filters = {
        role: "",
        isActive: "",
        isBlocked: "",
        search: "",
      };
      state.currentPage = 1;
    },

    setAdminPage: (state, action) => {
      const page = Number(action.payload) || 1;
      state.currentPage = Math.max(page, 1);
    },

    setAdminLimit: (state, action) => {
      const limit = Number(action.payload) || 10;
      state.limit = Math.max(limit, 1);
      state.currentPage = 1;
    },

    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    clearAdminState: (state) => {
      state.admin = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.selectedAccount = null;
      state.accounts = [];
      state.totalAccounts = 0;
      state.currentPage = 1;
      state.totalPages = 1;
      state.error = null;
      state.message = null;

      clearAdminAccessToken();
      clearSessionFromStorage();
    },

    resetAdminStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.message = null;
      state.error = null;
    },

    clearSendNotificationStatus: (state) => {
      state.sendNotificationSuccess = false;
      state.sendNotificationError = null;
      state.lastSentNotificationResult = null;
    },

    clearNotificationsError: (state) => {
      state.notificationsError = null;
    },
  },

  extraReducers: (builder) => {
    /* CREATE ACCOUNT */
    builder
      .addCase(createAdminAccount.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAdminAccount.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.message = action.payload.message;

        const createdAccount = action.payload.data;

        if (createdAccount) {
          state.accounts = [createdAccount, ...state.accounts];
          state.totalAccounts += 1;
        }
      })
      .addCase(createAdminAccount.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* UPDATE ACCOUNT */
    builder
      .addCase(updateAdminAccount.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAdminAccount.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.message = action.payload.message;

        const updatedAccount = action.payload.data;
        const updatedId =
          action.payload.id || updatedAccount?._id || updatedAccount?.id;

        if (updatedId) {
          const index = state.accounts.findIndex(
            (account) =>
              account?._id === updatedId || account?.id === updatedId,
          );

          if (index !== -1 && updatedAccount) {
            state.accounts[index] = updatedAccount;
          }

          if (
            state.selectedAccount &&
            (state.selectedAccount?._id === updatedId ||
              state.selectedAccount?.id === updatedId) &&
            updatedAccount
          ) {
            state.selectedAccount = updatedAccount;
          }

          if (
            state.admin &&
            (state.admin?._id === updatedId || state.admin?.id === updatedId) &&
            updatedAccount
          ) {
            state.admin = updatedAccount;
          }
        }
      })
      .addCase(updateAdminAccount.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* DELETE ACCOUNT */
    builder
      .addCase(deleteAdminAccount.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAdminAccount.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message = action.payload.message;

        const deletedId = action.payload.id;

        state.accounts = state.accounts.filter(
          (account) => account?._id !== deletedId && account?.id !== deletedId,
        );
        state.totalAccounts = Math.max(0, state.totalAccounts - 1);

        if (
          state.selectedAccount &&
          (state.selectedAccount?._id === deletedId ||
            state.selectedAccount?.id === deletedId)
        ) {
          state.selectedAccount = null;
        }
      })
      .addCase(deleteAdminAccount.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* GET ALL ACCOUNTS */
    builder
      .addCase(getAdminAccounts.pending, (state) => {
        state.accountsLoading = true;
        state.error = null;
      })
      .addCase(getAdminAccounts.fulfilled, (state, action) => {
        state.accountsLoading = false;
        state.accounts = action.payload.items || [];
        state.totalAccounts = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.limit = action.payload.limit || 10;
        state.totalPages = action.payload.totalPages || 1;
        state.message = action.payload.message;
      })
      .addCase(getAdminAccounts.rejected, (state, action) => {
        state.accountsLoading = false;
        state.error = action.payload;
      });

    /* GET ACCOUNT BY ID */
    builder
      .addCase(getAdminAccountById.pending, (state) => {
        state.accountLoading = true;
        state.error = null;
      })
      .addCase(getAdminAccountById.fulfilled, (state, action) => {
        state.accountLoading = false;
        state.selectedAccount = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(getAdminAccountById.rejected, (state, action) => {
        state.accountLoading = false;
        state.error = action.payload;
      });

    /* SEND LOGIN OTP */
    builder
      .addCase(sendAdminLoginOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendAdminLoginOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(sendAdminLoginOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* ADMIN LOGIN */
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.success = true;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.message = action.payload.message;

        const loginData = action.payload?.data;

        if (loginData) {
          state.admin = loginData.admin || null;
          state.accessToken = loginData.accessToken || null;
          state.refreshToken = loginData.refreshToken || null;
          state.selectedAccount = loginData.admin || null;

          saveSessionToStorage({
            adminId: loginData.adminId,
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
          });
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
        state.success = false;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.selectedAccount = null;

        clearSessionFromStorage();
      });

    /* CHECK ADMIN AUTH (refresh/reload restore) */
    builder
      .addCase(checkAdminAuth.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.authLoading = false;
        state.authChecked = true;
        state.isAuthenticated = true;

        const data = action.payload?.data;

        if (data) {
          state.admin = data.admin || state.admin;
          state.accessToken = data.accessToken || state.accessToken;
          state.refreshToken = data.refreshToken || state.refreshToken;
          state.selectedAccount = data.admin || state.selectedAccount;

          saveSessionToStorage({
            adminId: data.adminId,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        }
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.authLoading = false;
        state.authChecked = true;
        state.isAuthenticated = false;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.selectedAccount = null;
      });

    /* REFRESH TOKEN (mid-session, e.g. on 401) */
    builder
      .addCase(refreshAdminTokens.pending, (state) => {
        state.refreshLoading = true;
        state.error = null;
      })
      .addCase(refreshAdminTokens.fulfilled, (state, action) => {
        state.refreshLoading = false;

        const tokenData = action.payload?.data;

        if (tokenData) {
          state.accessToken = tokenData.accessToken || state.accessToken;
          state.refreshToken = tokenData.refreshToken || state.refreshToken;

          saveSessionToStorage({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
          });
        }

        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(refreshAdminTokens.rejected, (state, action) => {
        state.refreshLoading = false;
        state.error = action.payload;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.selectedAccount = null;

        clearAdminAccessToken();
        clearSessionFromStorage();
      });

    /* LOGOUT */
    builder
      .addCase(adminLogout.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state, action) => {
        state.logoutLoading = false;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.selectedAccount = null;
        state.accounts = [];
        state.totalAccounts = 0;
        state.currentPage = 1;
        state.totalPages = 1;
        state.success = true;
        state.message = action.payload.message;

        clearAdminAccessToken();
        clearSessionFromStorage();
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.logoutLoading = false;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.selectedAccount = null;
        state.accounts = [];
        state.error = action.payload;

        clearAdminAccessToken();
        clearSessionFromStorage();
      });

    /* =====================================================
       SEND PUSH NOTIFICATION
    ===================================================== */
    builder
      .addCase(sendPushNotification.pending, (state) => {
        state.sendNotificationLoading = true;
        state.sendNotificationError = null;
        state.sendNotificationSuccess = false;
      })
      .addCase(sendPushNotification.fulfilled, (state, action) => {
        state.sendNotificationLoading = false;
        state.sendNotificationSuccess = true;
        state.lastSentNotificationResult = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(sendPushNotification.rejected, (state, action) => {
        state.sendNotificationLoading = false;
        state.sendNotificationError = action.payload;
        state.sendNotificationSuccess = false;
      });

    /* =====================================================
       GET ADMIN NOTIFICATIONS
    ===================================================== */
    builder
      .addCase(getAdminNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.notificationsError = null;
      })
      .addCase(getAdminNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload.items;
        state.notificationsTotal = action.payload.total;
        state.notificationsPage = action.payload.page;
        state.notificationsLimit = action.payload.limit;
        state.notificationsTotalPages = action.payload.totalPages;
        state.message = action.payload.message;
      })
      .addCase(getAdminNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.notificationsError = action.payload;
      });

    /* =====================================================
       GET ADMIN OVERVIEW (DASHBOARD)
    ===================================================== */
    builder
      .addCase(getAdminOverview.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
      })
      .addCase(getAdminOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload.data;
        state.overviewError = null;
      })
      .addCase(getAdminOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.payload;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearAdminError,
  clearAdminSuccess,
  clearSelectedAccount,
  setAdminFilters,
  clearAdminFilters,
  setAdminPage,
  setAdminLimit,
  setAdmin,
  clearAdminState,
  resetAdminStatus,
  clearSendNotificationStatus,
  clearNotificationsError,
} = adminSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAdmin = (state) => state.admin;

export const selectAccounts = (state) => state.admin.accounts;

export const selectSelectedAccount = (state) => state.admin.selectedAccount;

export const selectAdminLoading = (state) => state.admin.accountsLoading;

export const selectAdminError = (state) => state.admin.error;

export const selectAdminFilters = (state) => state.admin.filters;

export const selectAdminAuth = createSelector(
  [
    (state) => state.admin?.admin,
    (state) => state.admin?.accessToken,
    (state) => state.admin?.refreshToken,
    (state) => state.admin?.isAuthenticated,
    (state) => state.admin?.authChecked,
    (state) => state.admin?.authLoading,
  ],
  (
    admin,
    accessToken,
    refreshToken,
    isAuthenticated,
    authChecked,
    authLoading,
  ) => ({
    admin,
    accessToken,
    refreshToken,
    isAuthenticated,
    authChecked,
    authLoading,
  }),
);

/* Push Notifications Selectors */
export const selectNotifications = (state) => state.admin.notifications;

export const selectNotificationsTotal = (state) =>
  state.admin.notificationsTotal;

export const selectNotificationsLoading = (state) =>
  state.admin.notificationsLoading;

export const selectNotificationsError = (state) =>
  state.admin.notificationsError;

export const selectNotificationsPagination = createSelector(
  [(state) => state.admin],
  (admin) => ({
    total: admin?.notificationsTotal || 0,
    page: admin?.notificationsPage || 1,
    limit: admin?.notificationsLimit || 10,
    totalPages: admin?.notificationsTotalPages || 1,
  }),
);

export const selectSendNotificationLoading = (state) =>
  state.admin.sendNotificationLoading;

export const selectSendNotificationError = (state) =>
  state.admin.sendNotificationError;

export const selectSendNotificationSuccess = (state) =>
  state.admin.sendNotificationSuccess;

export const selectLastSentNotificationResult = (state) =>
  state.admin.lastSentNotificationResult;

/* Dashboard Overview Selectors */
export const selectAdminOverview = (state) => state.admin?.overview;
export const selectOverviewLoading = (state) => state.admin?.overviewLoading;
export const selectOverviewError = (state) => state.admin?.overviewError;

/* =========================================================
   EXPORT REDUCER
========================================================= */

export default adminSlice.reducer;
