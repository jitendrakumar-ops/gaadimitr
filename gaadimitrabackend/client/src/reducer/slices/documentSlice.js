import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getDocumentFromResponse = (response) => {
  const data = response?.data ?? response;
  if (data?.data !== undefined) return data.data;
  return data;
};

/* =========================================================
   ASYNC THUNKS
========================================================= */

/**
 * GET /documents/all
 * Retrieve all drivers with their documents for admin
 */
export const getAllDriverDocuments = createAsyncThunk(
  "document/getAllDriverDocuments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/documents/all", {
        params: { search: params.search?.trim() || undefined },
      });
      return getDocumentFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch driver documents list"),
      );
    }
  },
);

/**
 * GET /documents/me
 * Retrieve documents of the currently authenticated driver
 */
export const getMyDocuments = createAsyncThunk(
  "document/getMyDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/documents/me");
      return getDocumentFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch your documents"),
      );
    }
  },
);

/**
 * GET /documents/driver/:driverId
 * Retrieve documents for a specific driver
 */
export const getDriverDocuments = createAsyncThunk(
  "document/getDriverDocuments",
  async (driverId, { rejectWithValue }) => {
    try {
      if (!driverId) {
        return rejectWithValue("Driver ID is required");
      }
      const response = await adminApi.get(`/documents/driver/${driverId}`);
      return getDocumentFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch driver documents"),
      );
    }
  },
);

/**
 * PATCH /documents/driver/:driverId/verify
 * Admin verifies or rejects driver documents
 * Payload: { status: 'pending'|'approved'|'rejected', rejectionReason?, itemVerifications?: { drivingLicense?, rc?, insurance?, permit?, aadharCard? } }
 */
export const verifyDocuments = createAsyncThunk(
  "document/verifyDocuments",
  async ({ driverId, status, rejectionReason, itemVerifications }, { rejectWithValue }) => {
    try {
      if (!driverId) {
        return rejectWithValue("Driver ID is required");
      }

      const payload = {
        status,
        ...(rejectionReason !== undefined && { rejectionReason }),
        ...(itemVerifications && { itemVerifications }),
      };

      const response = await adminApi.patch(
        `/documents/driver/${driverId}/verify`,
        payload,
      );

      return {
        data: getDocumentFromResponse(response),
        message:
          response?.data?.message ||
          `Driver documents verification status updated to ${status}`,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update document verification status"),
      );
    }
  },
);

/**
 * PATCH /documents/upload or POST /documents/upload
 * Update full or partial driver documents
 */
export const updateDocuments = createAsyncThunk(
  "document/updateDocuments",
  async (formDataOrPayload, { rejectWithValue }) => {
    try {
      const isFormData = formDataOrPayload instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await adminApi.patch(
        "/documents/upload",
        formDataOrPayload,
        { headers },
      );

      return {
        data: getDocumentFromResponse(response),
        message:
          response?.data?.message || "Driver documents updated successfully",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update documents"),
      );
    }
  },
);

/**
 * PATCH /documents/:docType or POST /documents/:docType
 * docType: 'drivingLicense' | 'rc' | 'insurance' | 'permit' | 'aadharCard'
 */
export const updateSpecificDocument = createAsyncThunk(
  "document/updateSpecificDocument",
  async ({ docType, data }, { rejectWithValue }) => {
    try {
      if (!docType) {
        return rejectWithValue("Document type is required");
      }

      const isFormData = data instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await adminApi.patch(`/documents/${docType}`, data, {
        headers,
      });

      return {
        data: getDocumentFromResponse(response),
        docType,
        message:
          response?.data?.message ||
          `${docType} document updated successfully`,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, `Failed to update ${docType} document`),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  // Current driver's documents
  documents: null,
  myDocuments: null,

  // All drivers with documents for admin
  drivers: [],
  driversLoading: false,
  driversError: null,

  // General loading & error
  loading: false,
  error: null,
  success: false,
  message: null,

  // Verification state
  verifyLoading: false,
  verifySuccess: false,
  verifyError: null,

  // Update state
  updateLoading: false,
  updateSuccess: false,
  updateError: null,
};

/* =========================================================
   SLICE
========================================================= */

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
      state.verifyError = null;
      state.updateError = null;
    },
    clearDocumentSuccess: (state) => {
      state.success = false;
      state.verifySuccess = false;
      state.updateSuccess = false;
      state.message = null;
    },
    resetDocumentState: () => initialState,
    setLocalDocumentItemVerification: (state, action) => {
      const { docKey, isVerified } = action.payload;
      if (state.documents && state.documents[docKey]) {
        state.documents[docKey].isVerified = isVerified;
      }
    },
  },
  extraReducers: (builder) => {
    // -------------------------------------------------------
    // getAllDriverDocuments
    // -------------------------------------------------------
    builder
      .addCase(getAllDriverDocuments.pending, (state) => {
        state.driversLoading = true;
        state.driversError = null;
      })
      .addCase(getAllDriverDocuments.fulfilled, (state, action) => {
        state.driversLoading = false;
        state.drivers = Array.isArray(action.payload) ? action.payload : [];
        state.driversError = null;
      })
      .addCase(getAllDriverDocuments.rejected, (state, action) => {
        state.driversLoading = false;
        state.driversError = action.payload;
      });

    // -------------------------------------------------------
    // getMyDocuments
    // -------------------------------------------------------
    builder
      .addCase(getMyDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.myDocuments = action.payload;
        state.error = null;
      })
      .addCase(getMyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // -------------------------------------------------------
    // getDriverDocuments
    // -------------------------------------------------------
    builder
      .addCase(getDriverDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDriverDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(getDriverDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.documents = null;
      });

    // -------------------------------------------------------
    // verifyDocuments
    // -------------------------------------------------------
    builder
      .addCase(verifyDocuments.pending, (state) => {
        state.verifyLoading = true;
        state.verifyError = null;
        state.verifySuccess = false;
      })
      .addCase(verifyDocuments.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.verifySuccess = true;
        state.verifyError = null;
        state.documents = action.payload.data;
        state.message = action.payload.message;

        // Sync updated verification status into drivers array
        const updated = action.payload.data;
        if (updated && state.drivers?.length > 0) {
          const targetDriverId = updated.driverId?.toString() || updated.userId?.toString();
          state.drivers = state.drivers.map((d) => {
            if (
              d.driverId === targetDriverId ||
              d.id === targetDriverId ||
              d.userMongoId === targetDriverId
            ) {
              return {
                ...d,
                overallStatus: updated.status || d.overallStatus,
                documents: (d.documents || []).map((doc) => {
                  const key = doc.key;
                  if (key && updated[key]) {
                    return {
                      ...doc,
                      status: updated[key].isVerified ? "approved" : "pending",
                    };
                  }
                  return doc;
                }),
                rawDocument: updated,
              };
            }
            return d;
          });
        }
      })
      .addCase(verifyDocuments.rejected, (state, action) => {
        state.verifyLoading = false;
        state.verifyError = action.payload;
        state.verifySuccess = false;
      });

    // -------------------------------------------------------
    // updateDocuments
    // -------------------------------------------------------
    builder
      .addCase(updateDocuments.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateDocuments.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.updateError = null;
        state.documents = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateDocuments.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      });

    // -------------------------------------------------------
    // updateSpecificDocument
    // -------------------------------------------------------
    builder
      .addCase(updateSpecificDocument.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateSpecificDocument.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.updateError = null;
        state.documents = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateSpecificDocument.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  clearDocumentError,
  clearDocumentSuccess,
  resetDocumentState,
  setLocalDocumentItemVerification,
} = documentSlice.actions;

export const selectDriverDocuments = (state) => state.document?.documents;
export const selectMyDocuments = (state) => state.document?.myDocuments;
export const selectDrivers = (state) => state.document?.drivers || [];
export const selectDriversLoading = (state) => state.document?.driversLoading;
export const selectDriversError = (state) => state.document?.driversError;
export const selectDocumentsLoading = (state) => state.document?.loading;
export const selectDocumentsError = (state) => state.document?.error;
export const selectVerifyLoading = (state) => state.document?.verifyLoading;
export const selectVerifySuccess = (state) => state.document?.verifySuccess;
export const selectVerifyError = (state) => state.document?.verifyError;
export const selectUpdateLoading = (state) => state.document?.updateLoading;
export const selectUpdateSuccess = (state) => state.document?.updateSuccess;
export const selectDocumentMessage = (state) => state.document?.message;

export default documentSlice.reducer;
