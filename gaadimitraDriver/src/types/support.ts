export interface SupportMessage {
  _id?: string;
  id?: string;
  senderId?: string;
  senderRole?: 'user' | 'driver' | 'admin' | string;
  content: string;
  type?: 'text' | 'image' | 'file';
  mediaUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicket {
  _id?: string;
  id: string;
  participantId?: string;
  participantRole?: 'user' | 'driver' | string;
  driverId?: string | null;
  adminAssigned?: string | null;
  subject: string;
  category?: 'account' | 'booking' | 'payment' | 'driver' | 'vehicle' | 'technical' | 'other' | string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string;
  status: 'open' | 'pending' | 'resolved' | 'closed' | string;
  lastMessage?: string;
  lastMessageAt?: string;
  isActive?: boolean;
  messages: SupportMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupportTicketPayload {
  subject: string;
  message: string;
  category?: string;
  priority?: string;
}

export interface SupportTicketsResponse {
  success: boolean;
  message: string;
  data: SupportTicket[];
}

export interface SupportTicketResponse {
  success: boolean;
  message: string;
  data: SupportTicket;
}

export interface AddSupportMessageResponse {
  success: boolean;
  message: string;
  data: SupportMessage;
}
