import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supportService } from '../../services/supportService';
import {
  SupportTicket,
  SupportMessage,
  CreateSupportTicketPayload,
} from '../../types/support';

export interface SupportState {
  tickets: SupportTicket[];
  activeTicket: SupportTicket | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  activeTicket: null,
  isLoading: false,
  isSending: false,
  error: null,
};

/**
 * Fetch all support tickets for driver
 * GET /support/tickets
 */
export const fetchSupportTickets = createAsyncThunk<
  SupportTicket[],
  void,
  { rejectValue: string }
>('support/fetchSupportTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await supportService.getTickets();
    return response.data || [];
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch support tickets.';
    return rejectWithValue(message);
  }
});

/**
 * Fetch single support ticket by ID
 * GET /support/tickets/:ticketId
 */
export const fetchSupportTicketById = createAsyncThunk<
  SupportTicket,
  string,
  { rejectValue: string }
>('support/fetchSupportTicketById', async (ticketId, { rejectWithValue }) => {
  try {
    const response = await supportService.getTicketById(ticketId);
    return response.data;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch ticket details.';
    return rejectWithValue(message);
  }
});

/**
 * Create a new support ticket
 * POST /support/tickets
 */
export const createSupportTicket = createAsyncThunk<
  SupportTicket,
  CreateSupportTicketPayload,
  { rejectValue: string }
>('support/createSupportTicket', async (payload, { rejectWithValue }) => {
  try {
    const response = await supportService.createTicket(payload);
    return response.data;
  } catch (err: any) {
    const message = err?.message || 'Failed to create support ticket.';
    return rejectWithValue(message);
  }
});

/**
 * Send message to an existing ticket
 * POST /support/tickets/:ticketId/messages
 */
export const sendSupportMessage = createAsyncThunk<
  SupportMessage,
  { ticketId: string; message: string },
  { rejectValue: string }
>('support/sendSupportMessage', async ({ ticketId, message }, { rejectWithValue }) => {
  try {
    const response = await supportService.addMessage(ticketId, message);
    return response.data;
  } catch (err: any) {
    const message = err?.message || 'Failed to send message.';
    return rejectWithValue(message);
  }
});

export const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setActiveTicket: (state, action: PayloadAction<SupportTicket | null>) => {
      state.activeTicket = action.payload;
    },
    appendOptimisticMessage: (
      state,
      action: PayloadAction<{ content: string; senderRole: 'driver' | 'user' }>
    ) => {
      if (state.activeTicket) {
        const optimisticMsg: SupportMessage = {
          _id: `temp-${Date.now()}`,
          id: `temp-${Date.now()}`,
          senderId: 'driver',
          senderRole: action.payload.senderRole,
          content: action.payload.content,
          type: 'text',
          createdAt: new Date().toISOString(),
        };
        state.activeTicket.messages.push(optimisticMsg);
      }
    },
    clearSupportError: (state) => {
      state.error = null;
    },
    resetSupportState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch tickets
    builder
      .addCase(fetchSupportTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload;
        // Select open/pending ticket or most recent
        if (action.payload.length > 0) {
          const openTicket =
            action.payload.find((t) => t.status === 'open' || t.status === 'pending') ||
            action.payload[0];
          state.activeTicket = openTicket;
        }
      })
      .addCase(fetchSupportTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tickets';
      });

    // Fetch ticket by ID
    builder
      .addCase(fetchSupportTicketById.fulfilled, (state, action) => {
        state.activeTicket = action.payload;
        const index = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      });

    // Create ticket
    builder
      .addCase(createSupportTicket.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.isSending = false;
        state.activeTicket = action.payload;
        state.tickets.unshift(action.payload);
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || 'Failed to create ticket';
      });

    // Send message
    builder
      .addCase(sendSupportMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendSupportMessage.fulfilled, (state, action) => {
        state.isSending = false;
        if (state.activeTicket) {
          const existing = state.activeTicket.messages.find(
            (m) => m._id === action.payload._id || (m._id?.startsWith('temp-') && m.content === action.payload.content)
          );
          if (!existing) {
            state.activeTicket.messages.push(action.payload);
          } else if (existing._id?.startsWith('temp-')) {
            existing._id = action.payload._id;
            existing.createdAt = action.payload.createdAt;
          }
          state.activeTicket.lastMessage = action.payload.content;
          state.activeTicket.lastMessageAt = action.payload.createdAt || new Date().toISOString();
        }
      })
      .addCase(sendSupportMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || 'Failed to send message';
      });
  },
});

export const {
  setActiveTicket,
  appendOptimisticMessage,
  clearSupportError,
  resetSupportState,
} = supportSlice.actions;

export default supportSlice.reducer;
