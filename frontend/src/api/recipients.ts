import { apiClient } from './client';
import type {
  Recipient,
  CreateRecipientRequest,
  ApiResponse,
  PaginationResponse,
} from '@/types';

export const recipientsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginationResponse<Recipient>> => {
    const response = await apiClient.get<PaginationResponse<Recipient>>(
      '/recipients',
      { params }
    );
    return response.data;
  },

  getById: async (id: number): Promise<Recipient> => {
    const response = await apiClient.get<ApiResponse<Recipient>>(
      `/recipients/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateRecipientRequest): Promise<Recipient> => {
    const response = await apiClient.post<ApiResponse<Recipient>>(
      '/recipients',
      data
    );
    return response.data.data;
  },
};
