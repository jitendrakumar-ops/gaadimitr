import { apiClient } from './api';
import {
  CreateSupportTicketPayload,
  SupportTicketsResponse,
  SupportTicketResponse,
  AddSupportMessageResponse,
} from '../types/support';

export const supportService = {
  /**
   * Get all support tickets for the authenticated driver
   * GET /support/tickets
   */
  getTickets: async (): Promise<SupportTicketsResponse> => {
    return await apiClient.get<SupportTicketsResponse>('/support/tickets');
  },

  /**
   * Get ticket details by ID
   * GET /support/tickets/:ticketId
   */
  getTicketById: async (ticketId: string): Promise<SupportTicketResponse> => {
    return await apiClient.get<SupportTicketResponse>(`/support/tickets/${ticketId}`);
  },

  /**
   * Create a new support ticket
   * POST /support/tickets
   */
  createTicket: async (payload: CreateSupportTicketPayload): Promise<SupportTicketResponse> => {
    return await apiClient.post<SupportTicketResponse>('/support/tickets', payload);
  },

  /**
   * Add message to an existing ticket
   * POST /support/tickets/:ticketId/messages
   */
  addMessage: async (ticketId: string, message: string): Promise<AddSupportMessageResponse> => {
    return await apiClient.post<AddSupportMessageResponse>(`/support/tickets/${ticketId}/messages`, {
      message,
    });
  },
};

export default supportService;
