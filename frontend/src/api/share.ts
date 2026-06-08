import api from './axios';

export interface ShareResponse {
  url: string;
}

export const shareApi = {
  getShareUrl: async (username: string): Promise<ShareResponse> => {
    const response = await api.post<ShareResponse>('/api/share/', { username });
    return response.data;
  },
};
