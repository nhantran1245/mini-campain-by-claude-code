import { apiClient } from './client';
import type {
  Campaign,
  CampaignWithStats,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  ScheduleCampaignRequest,
  CampaignStats,
  CampaignRecipient,
  ApiResponse,
  PaginationResponse,
} from '@/types';

export const campaignsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginationResponse<Campaign>> => {
    const response = await apiClient.get<PaginationResponse<Campaign>>(
      '/campaigns',
      { params }
    );
    return response.data;
  },

  getById: async (id: number): Promise<CampaignWithStats> => {
    const response = await apiClient.get<ApiResponse<CampaignWithStats>>(
      `/campaigns/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(
      '/campaigns',
      data
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateCampaignRequest
  ): Promise<Campaign> => {
    const response = await apiClient.patch<ApiResponse<Campaign>>(
      `/campaigns/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  schedule: async (
    id: number,
    data: ScheduleCampaignRequest
  ): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(
      `/campaigns/${id}/schedule`,
      data
    );
    return response.data.data;
  },

  send: async (id: number): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(
      `/campaigns/${id}/send`
    );
    return response.data.data;
  },

  getStats: async (id: number): Promise<CampaignStats> => {
    const response = await apiClient.get<ApiResponse<CampaignStats>>(
      `/campaigns/${id}/stats`
    );
    return response.data.data;
  },

  getRecipients: async (
    id: number,
    params?: { page?: number; limit?: number }
  ): Promise<PaginationResponse<CampaignRecipient>> => {
    const response = await apiClient.get<
      PaginationResponse<CampaignRecipient>
    >(`/campaigns/${id}/recipients`, { params });
    return response.data;
  },
};
