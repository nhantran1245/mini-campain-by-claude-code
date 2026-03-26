// Campaign Status
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Campaign Types
export interface Campaign {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithStats extends Campaign {
  stats: CampaignStats;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  body: string;
  recipient_ids: number[];
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  body?: string;
}

export interface ScheduleCampaignRequest {
  scheduled_at: string;
}

// Recipient Types
export interface Recipient {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface CreateRecipientRequest {
  email: string;
  name: string;
}

export interface CampaignRecipient {
  id: number;
  email: string;
  name: string;
  sent_at: string | null;
  opened_at: string | null;
  status: 'pending' | 'sent' | 'failed';
}
