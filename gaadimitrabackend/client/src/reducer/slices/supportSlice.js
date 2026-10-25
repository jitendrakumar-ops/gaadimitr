import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getTicketFromResponse = (response) => {
  const data = response?.data ?? response;
  return data?.ticket || data?.item || data?.data || data || null;
};

const getItemsFromResponse = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.tickets)) return data.tickets;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.tickets)) return response.tickets;

  return [];
};

/* =========================================================
   ADMIN GET ALL TICKETS
   GET /support/admin/tickets
========================================================= */

export const adminGetAllTickets = createAsyncThunk(
  "support/adminGetAllTickets",
  async (
    { page = 1, limit = 20, status, category, priority, participantRole, search } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit };

      if (search?.trim()) params.search = search.trim();
      if (status && status !== "all") params.status = status;
      if (category && category !== "all") params.category = category;
      if (priority && priority !== "all") params.priority = priority;
      if (participantRole && participantRole !== "all") params.participantRole = participantRole;

      const response = await adminApi.get("/support/admin/tickets", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch support tickets"),
      );
    }
  },
);

/* =========================================================
   GET TICKET BY ID
   GET /support/tickets/:ticketId
========================================================= */

export const getTicketById = createAsyncThunk(
  "support/getTicketById",
  async (ticketId, { rejectWithValue }) => {
    try {
      if (!ticketId) return rejectWithValue("Ticket ID is required");

      const response = await adminApi.get(`/support/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch ticket details"),
      );
    }
  },
);

/* =========================================================
   ADMIN REPLY TO TICKET
   POST /support/admin/tickets/:ticketId/reply
========================================================= */

export const adminReplyToTicket = createAsyncThunk(
  "support/adminReplyToTicket",
  async ({ ticketId, message }, { rejectWithValue }) => {
    try {
      if (!ticketId) return rejectWithValue("Ticket ID is required");
      if (!message?.trim()) return rejectWithValue("Message is required");

      const response = await adminApi.post(
        `/support/admin/tickets/${ticketId}/reply`,
        { message: message.trim() },
      );

      return { ticketId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to send reply"),
      );
    }
  },
);

/* =========================================================
   ADMIN UPDATE TICKET STATUS
   PATCH /support/admin/tickets/:ticketId/status
========================================================= */

export const adminUpdateTicketStatus = createAsyncThunk(
  "support/adminUpdateTicketStatus",
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      if (!ticketId) return rejectWithValue("Ticket ID is required");

      const response = await adminApi.patch(
        `/support/admin/tickets/${ticketId}/status`,
        { status },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update ticket status"),
      );
    }
  },
);

/* =========================================================
   ADMIN DELETE TICKET
   DELETE /support/admin/tickets/:ticketId
========================================================= */

export const adminDeleteTicket = createAsyncThunk(
  "support/adminDeleteTicket",
  async (ticketId, { rejectWithValue }) => {
    try {
      if (!ticketId) return rejectWithValue("Ticket ID is required");

      const response = await adminApi.delete(
        `/support/admin/tickets/${ticketId}`,
      );

      return { ticketId, response: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete ticket"),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  tickets: [],
  selectedTicket: null,

  totalTickets: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 20,
  hasNextPage: false,
  hasPrevPage: false,

  loading: false,
  detailsLoading: false,
  replyLoading: false,
  statusUpdateLoading: false,
  deleteLoading: false,

  error: null,
  detailsError: null,
  replyError: null,
  statusUpdateError: null,
  deleteError: null,

  success: false,
  message: null,
  status: "idle",
};

/* =========================================================
   SLICE
========================================================= */

const supportSlice = createSlice({
  name: "support",
  initialState,

  reducers: {
    clearSupportError: (state) => {
      state.error = null;
      state.detailsError = null;
      state.replyError = null;
      state.statusUpdateError = null;
      state.deleteError = null;
    },

    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },

    clearSupportSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    resetSupportState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       ADMIN GET ALL TICKETS
    ===================================================== */

    builder
      .addCase(adminGetAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(adminGetAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";

        const response = action.payload;
        const data = response?.data;

        if (Array.isArray(data?.items)) {
          state.tickets = data.items;
        } else if (Array.isArray(data?.tickets)) {
          state.tickets = data.tickets;
        } else if (Array.isArray(data)) {
          state.tickets = data;
        } else if (Array.isArray(response?.tickets)) {
          state.tickets = response.tickets;
        } else {
          state.tickets = getItemsFromResponse(response);
        }

        const pagination = data?.pagination || response?.pagination || {};

        state.totalTickets =
          pagination.total ?? data?.total ?? state.tickets.length;
        state.currentPage = pagination.page ?? data?.page ?? 1;
        state.limit = pagination.limit ?? data?.limit ?? 20;
        state.totalPages =
          pagination.totalPages ??
          pagination.total_pages ??
          Math.max(1, Math.ceil(state.totalTickets / state.limit));
        state.hasNextPage = pagination.hasNextPage ?? false;
        state.hasPrevPage = pagination.hasPrevPage ?? false;
      })
      .addCase(adminGetAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Failed to fetch support tickets";
      });

    /* =====================================================
       GET TICKET BY ID
    ===================================================== */

    builder
      .addCase(getTicketById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.selectedTicket = null;
      })
      .addCase(getTicketById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedTicket = getTicketFromResponse(action.payload);
      })
      .addCase(getTicketById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || "Failed to fetch ticket details";
      });

    /* =====================================================
       ADMIN REPLY TO TICKET
    ===================================================== */

    builder
      .addCase(adminReplyToTicket.pending, (state) => {
        state.replyLoading = true;
        state.replyError = null;
        state.success = false;
      })
      .addCase(adminReplyToTicket.fulfilled, (state, action) => {
        state.replyLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Reply sent successfully";

        // Push the new message into selectedTicket if loaded
        const replyData = action.payload?.data?.data ?? action.payload?.data;
        if (state.selectedTicket && replyData) {
          if (!Array.isArray(state.selectedTicket.messages)) {
            state.selectedTicket.messages = [];
          }
          state.selectedTicket.messages.push(replyData);
          state.selectedTicket.lastMessage = replyData.content || replyData.message;
          state.selectedTicket.lastMessageAt = replyData.createdAt || new Date().toISOString();
        }
      })
      .addCase(adminReplyToTicket.rejected, (state, action) => {
        state.replyLoading = false;
        state.replyError = action.payload || "Failed to send reply";
        state.success = false;
      });

    /* =====================================================
       ADMIN UPDATE TICKET STATUS
    ===================================================== */

    builder
      .addCase(adminUpdateTicketStatus.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
        state.success = false;
      })
      .addCase(adminUpdateTicketStatus.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        state.success = true;
        state.message =
          action.payload?.message || "Ticket status updated successfully";

        const updatedTicket = getTicketFromResponse(action.payload);
        if (!updatedTicket) return;

        const updatedId = updatedTicket?._id || updatedTicket?.id;

        const index = state.tickets.findIndex(
          (t) => t?._id === updatedId || t?.id === updatedId,
        );

        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }

        if (
          state.selectedTicket?._id === updatedId ||
          state.selectedTicket?.id === updatedId
        ) {
          state.selectedTicket = {
            ...state.selectedTicket,
            ...updatedTicket,
            messages: state.selectedTicket.messages,
          };
        }
      })
      .addCase(adminUpdateTicketStatus.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError =
          action.payload || "Failed to update ticket status";
        state.success = false;
      });

    /* =====================================================
       ADMIN DELETE TICKET
    ===================================================== */

    builder
      .addCase(adminDeleteTicket.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.success = false;
      })
      .addCase(adminDeleteTicket.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message =
          action.payload?.response?.message ||
          "Support ticket deleted successfully";

        const ticketId = action.payload?.ticketId;

        state.tickets = state.tickets.filter(
          (t) => t?._id !== ticketId && t?.id !== ticketId,
        );

        if (
          state.selectedTicket?._id === ticketId ||
          state.selectedTicket?.id === ticketId
        ) {
          state.selectedTicket = null;
        }

        state.totalTickets = Math.max(0, state.totalTickets - 1);
      })
      .addCase(adminDeleteTicket.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete ticket";
        state.success = false;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearSupportError,
  clearSelectedTicket,
  clearSupportSuccess,
  resetSupportState,
} = supportSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectSupportTickets = (state) =>
  state.support?.tickets || [];

export const selectSelectedTicket = (state) =>
  state.support?.selectedTicket || null;

export const selectSupportLoading = (state) =>
  state.support?.loading || false;

export const selectSupportDetailsLoading = (state) =>
  state.support?.detailsLoading || false;

export const selectSupportReplyLoading = (state) =>
  state.support?.replyLoading || false;

export const selectSupportStatusUpdateLoading = (state) =>
  state.support?.statusUpdateLoading || false;

export const selectSupportDeleteLoading = (state) =>
  state.support?.deleteLoading || false;

export const selectSupportError = (state) =>
  state.support?.error || null;

export const selectSupportDetailsError = (state) =>
  state.support?.detailsError || null;

export const selectSupportReplyError = (state) =>
  state.support?.replyError || null;

export const selectSupportStatusUpdateError = (state) =>
  state.support?.statusUpdateError || null;

export const selectSupportDeleteError = (state) =>
  state.support?.deleteError || null;

export const selectSupportSuccess = (state) =>
  state.support?.success || false;

export const selectSupportMessage = (state) =>
  state.support?.message || null;

export const selectSupportPagination = createSelector(
  [
    (state) => state.support?.totalTickets || 0,
    (state) => state.support?.currentPage || 1,
    (state) => state.support?.totalPages || 1,
    (state) => state.support?.limit || 20,
    (state) => state.support?.hasNextPage || false,
    (state) => state.support?.hasPrevPage || false,
  ],
  (totalTickets, currentPage, totalPages, limit, hasNextPage, hasPrevPage) => ({
    totalTickets,
    currentPage,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage,
  }),
);

export default supportSlice.reducer;
