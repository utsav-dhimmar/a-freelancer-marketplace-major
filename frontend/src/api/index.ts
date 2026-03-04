import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import type {
  IAuthResponse,
  IContract,
  IFreelancer,
  IJob,
  IPortfolioItem,
  IProposal,
  IUser,
  ApiResponse,
} from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const STATIC_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login') &&
      !originalRequest.url?.includes('/register') &&
      !originalRequest.url?.includes('/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        const loginPath = window.location.pathname.startsWith('/admin')
          ? '/admin/login'
          : '/login';
        window.location.href = loginPath;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/users/refresh-token`, {
          refreshToken,
        });
        const { accessToken: newAccessToken } = response.data.data;
        localStorage.setItem('accessToken', newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        const loginPath = window.location.pathname.startsWith('/admin')
          ? '/admin/login'
          : '/login';
        window.location.href = loginPath;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    role: string;
    fullname: string;
    profilePicture?: File;
  }) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('username', data.username);
    formData.append('password', data.password);
    formData.append('role', data.role);
    formData.append('fullname', data.fullname);
    if (data.profilePicture) {
      formData.append('profilePicture', data.profilePicture);
    }

    const response = await api.post<ApiResponse<IAuthResponse>>(
      '/users/register',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<IAuthResponse>>('/users/login', data);
    const loginData = response.data.data;
    if (loginData.accessToken) {
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);
    }
    return loginData;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/users/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  me: async () => {
    const response = await api.get<ApiResponse<{ user: IUser }>>('/users/me');
    return response.data.data.user;
  },

  updateProfilePicture: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ profilePicture: string }>>(
      '/users/profile-picture',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data.data;
  },
};

export const jobApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    skills?: string;
  }) => {
    const response = await api.get<ApiResponse<{ jobs: IJob[]; total: number }>>('/jobs', {
      params,
    });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ job: IJob }>>(`/jobs/${id}`);
    return response.data.data.job;
  },

  create: async (data: Partial<IJob>) => {
    const response = await api.post<ApiResponse<{ job: IJob }>>('/jobs', data);
    return response.data.data.job;
  },

  update: async (id: string, data: Partial<IJob>) => {
    const response = await api.put<ApiResponse<{ job: IJob }>>(`/jobs/${id}`, data);
    return response.data.data.job;
  },

  delete: async (id: string) => {
    await api.delete(`/jobs/${id}`);
  },

  myJobs: async () => {
    const response = await api.get<ApiResponse<{ jobs: IJob[] }>>('/jobs/my-jobs');
    return response.data.data.jobs;
  },
};

export const freelancerApi = {
  getAll: async (params?: { search?: string; skills?: string }) => {
    const response = await api.get<ApiResponse<{
      freelancers: IFreelancer[];
      total: number;
    }>>('/freelancers', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ freelancer: IFreelancer }>>(`/freelancers/${id}`);
    return response.data.data.freelancer;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<{ freelancer: IFreelancer }>>('/freelancers/me');
    return response.data.data.freelancer;
  },

  create: async (data: Partial<IFreelancer>) => {
    const response = await api.post<ApiResponse<{ freelancer: IFreelancer }>>('/freelancers', data);
    return response.data.data.freelancer;
  },

  update: async (_id: string, data: Partial<IFreelancer>) => {
    const response = await api.put<ApiResponse<{ freelancer: IFreelancer }>>(`/freelancers`, data);
    return response.data.data.freelancer;
  },

  addPortfolioItem: async (item: IPortfolioItem) => {
    const response = await api.post<ApiResponse<{ freelancer: IFreelancer }>>(
      '/freelancers/portfolio',
      item,
    );
    return response.data.data.freelancer;
  },

  updatePortfolioItem: async (index: number, item: IPortfolioItem) => {
    const response = await api.put<ApiResponse<{ freelancer: IFreelancer }>>(
      `/freelancers/portfolio/${index}`,
      item,
    );
    return response.data.data.freelancer;
  },

  deletePortfolioItem: async (index: number) => {
    const response = await api.delete<ApiResponse<{ freelancer: IFreelancer }>>(
      `/freelancers/portfolio/${index}`,
    );
    return response.data.data.freelancer;
  },
};

export const proposalApi = {
  submit: async (data: {
    jobId: string;
    coverLetter: string;
    proposedAmount: number;
    estimatedDuration: number;
  }) => {
    const response = await api.post<ApiResponse<{ proposal: IProposal }>>('/proposals', data);
    return response.data.data.proposal;
  },

  getByJob: async (jobId: string) => {
    const response = await api.get<ApiResponse<{ proposals: IProposal[] }>>(`/proposals/job/${jobId}`);
    return response.data.data.proposals;
  },

  getMyProposals: async () => {
    const response = await api.get<ApiResponse<{ proposals: IProposal[] }>>('/proposals/my-proposals');
    return response.data.data.proposals;
  },

  update: async (id: string, data: Partial<IProposal>) => {
    const response = await api.put<ApiResponse<{ proposal: IProposal }>>(`/proposals/${id}`, data);
    return response.data.data.proposal;
  },

  withdraw: async (id: string) => {
    const response = await api.delete<ApiResponse<{ proposal: IProposal }>>(`/proposals/${id}`);
    return response.data?.data?.proposal || null;
  },

  accept: async (id: string) => {
    const response = await api.patch<ApiResponse<{ proposal: IProposal }>>(`/proposals/${id}/status`, { status: 'accepted' });
    return response.data.data.proposal;
  },

  reject: async (id: string) => {
    const response = await api.patch<ApiResponse<{ proposal: IProposal }>>(`/proposals/${id}/status`, { status: 'rejected' });
    return response.data.data.proposal;
  },
};

export const contractApi = {
  create: async (data: { jobId: string; proposalId: string }) => {
    const response = await api.post<ApiResponse<{ contract: IContract }>>('/contracts', data);
    return response.data.data.contract;
  },

  getMyContracts: async () => {
    const response = await api.get<ApiResponse<{ contracts: IContract[] }>>('/contracts');
    return response.data.data.contracts;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ contract: IContract }>>(`/contracts/${id}`);
    return response.data.data.contract;
  },

  submitWork: async (id: string, workDescription: string) => {
    const response = await api.patch<ApiResponse<{ contract: IContract }>>(`/contracts/${id}/submit`, {
      workDescription,
    });
    return response.data.data.contract;
  },

  completeContract: async (id: string) => {
    const response = await api.patch<ApiResponse<{ contract: IContract }>>(`/contracts/${id}/complete`);
    return response.data.data.contract;
  },

  raiseDispute: async (id: string, reason: string) => {
    const response = await api.patch<ApiResponse<{ contract: IContract }>>(`/contracts/${id}/dispute`, {
      reason,
    });
    return response.data.data.contract;
  },
};

export interface IChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface IChatInfo {
  contractId: string;
  totalMessages: number;
  lastMessageAt: string | null;
  lastMessage: string | null;
  lastSenderName: string | null;
}

export const chatApi = {
  sendMessage: async (contractId: string, message: string) => {
    const response = await api.post<ApiResponse<{ message: IChatMessage }>>(
      `/chat/${contractId}/messages`,
      { message },
    );
    return response.data.data.message;
  },

  getMessages: async (contractId: string, page: number = 1, limit: number = 50) => {
    const response = await api.get<ApiResponse<{
      messages: IChatMessage[];
      total: number;
      page: number;
      totalPages: number;
    }>>(`/chat/${contractId}/messages`, { params: { page, limit } });
    return response.data.data;
  },

  getChatInfo: async (contractId: string) => {
    const response = await api.get<ApiResponse<{ chatInfo: IChatInfo }>>(
      `/chat/${contractId}/info`,
    );
    return response.data.data.chatInfo;
  },
};

export default api;
