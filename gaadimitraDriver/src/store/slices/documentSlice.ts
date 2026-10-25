import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentService } from '../../services/documentService';
import {
  DocType,
  DriverDocumentsData,
  UpdateSpecificDocResponse,
  GetDocumentsResponse,
} from '../../types/document';

interface DocumentState {
  documents: DriverDocumentsData | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadSuccess: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: null,
  isLoading: false,
  isUploading: false,
  uploadSuccess: false,
  error: null,
};

/**
 * Async Thunk to upload a specific driver document via POST /documents/:docType
 */
export const uploadSpecificDocument = createAsyncThunk<
  UpdateSpecificDocResponse,
  { docType: DocType; formData: FormData },
  { rejectValue: string }
>('document/uploadSpecificDocument', async ({ docType, formData }, { rejectWithValue }) => {
  try {
    const response = await documentService.uploadSpecificDocument(docType, formData);
    return response;
  } catch (err: any) {
    const message = err?.message || `Failed to upload ${docType}. Please try again.`;
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk to fetch authenticated driver documents via GET /documents/me
 */
export const fetchMyDocuments = createAsyncThunk<
  GetDocumentsResponse,
  void,
  { rejectValue: string }
>('document/fetchMyDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await documentService.getMyDocuments();
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch driver documents.';
    return rejectWithValue(message);
  }
});

export const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    resetUploadDocState: (state) => {
      state.isUploading = false;
      state.uploadSuccess = false;
      state.error = null;
    },
    clearDocError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload specific document
      .addCase(uploadSpecificDocument.pending, (state) => {
        state.isUploading = true;
        state.uploadSuccess = false;
        state.error = null;
      })
      .addCase(uploadSpecificDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadSuccess = true;
        state.error = null;
        const payload: any = action.payload;
        const docData = payload?.data?.documents || payload?.data || payload?.documents || payload;
        if (docData && typeof docData === 'object' && !Array.isArray(docData)) {
          state.documents = docData;
        }
      })
      .addCase(uploadSpecificDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadSuccess = false;
        state.error = action.payload || 'Failed to upload document';
      })

      // Fetch driver documents
      .addCase(fetchMyDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const payload: any = action.payload;
        const docData = payload?.data?.documents || payload?.data || payload?.documents || payload;
        if (docData && typeof docData === 'object' && !Array.isArray(docData)) {
          state.documents = docData;
        }
      })
      .addCase(fetchMyDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load documents';
      });
  },
});

export const { resetUploadDocState, clearDocError } = documentSlice.actions;
export default documentSlice.reducer;
