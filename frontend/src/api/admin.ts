import axios from 'axios';
import api from './index';
import type { IUser } from '../types';
import type {
  DashboardStats,
  AdminJobFilters,
  AdminContractFilters,
  IAdminJob,
  IAdminContract,
  IAdminReview,
} from '../types/admin';

interface ApiWrapper<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Extracts a user-friendly error message from an Axios error or unknown error.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export const adminApi = {
  // ─── Auth ────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<
        ApiWrapper<{ user: IUser; accessToken: string; refreshToken: string }>
      >('/admin/login', { email, password });
      const { accessToken, refreshToken } = response.data.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
      return response.data.data;
    } catch (err) {
      throw new Error(
        getErrorMessage(err, 'Login failed. Please check your credentials.'),
      );
    }
  },

  // ─── Admin Me ────────────────────────────────────────────────────
  getMe: async () => {
    try {
      const response = await api.get<ApiWrapper<{ user: IUser }>>('/admin/me');
      return response.data.data.user;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to get admin info.'));
    }
  },

  // ─── Admin Logout ────────────────────────────────────────────────
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/admin/logout', { refreshToken });
    } catch {
      // Ignore logout errors — we clear local state regardless
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // ─── Dashboard ───────────────────────────────────────────────────
  getDashboardStats: async () => {
    try {
      const response =
        await api.get<ApiWrapper<{ stats: DashboardStats }>>('/admin');
      return response.data.data.stats;
    } catch (err) {
      throw new Error(
        getErrorMessage(err, 'Failed to load dashboard statistics.'),
      );
    }
  },

  // ─── Users ───────────────────────────────────────────────────────
  getUsers: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<
        ApiWrapper<{
          users: IUser[];
          total: number;
          page: number;
          totalPages: number;
        }>
      >('/admin/users', { params: { page, limit } });
      return response.data.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load users.'));
    }
  },

  getUserById: async (id: string) => {
    try {
      const response = await api.get<ApiWrapper<{ user: IUser }>>(
        `/admin/users/${id}`,
      );
      return response.data.data.user;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load user details.'));
    }
  },

  updateUser: async (
    id: string,
    data: {
      role?: string;
      fullname?: string;
      email?: string;
      username?: string;
    },
  ) => {
    try {
      const response = await api.put<ApiWrapper<{ user: IUser }>>(
        `/admin/users/${id}`,
        data,
      );
      return response.data.data.user;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to update user.'));
    }
  },

  deleteUser: async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to delete user.'));
    }
  },

  // ─── Jobs ────────────────────────────────────────────────────────
  getJobs: async (page = 1, limit = 10, filters?: AdminJobFilters) => {
    try {
      const response = await api.get<
        ApiWrapper<{
          jobs: IAdminJob[];
          total: number;
          page: number;
          totalPages: number;
        }>
      >('/admin/jobs', {
        params: { page, limit, ...filters },
      });
      return response.data.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load jobs.'));
    }
  },

  deleteJob: async (id: string) => {
    try {
      await api.delete(`/admin/jobs/${id}`);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to delete job.'));
    }
  },

  // ─── Contracts ───────────────────────────────────────────────────
  getContracts: async (
    page = 1,
    limit = 10,
    filters?: AdminContractFilters,
  ) => {
    try {
      const response = await api.get<
        ApiWrapper<{
          contracts: IAdminContract[];
          total: number;
          page: number;
          totalPages: number;
        }>
      >('/admin/contracts', {
        params: { page, limit, ...filters },
      });
      return response.data.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load contracts.'));
    }
  },

  updateContractStatus: async (
    id: string,
    status: 'active' | 'submitted' | 'completed' | 'disputed',
  ) => {
    try {
      const response = await api.patch<
        ApiWrapper<{ contract: IAdminContract }>
      >(`/admin/contracts/${id}/status`, { status });
      return response.data.data.contract;
    } catch (err) {
      throw new Error(
        getErrorMessage(err, 'Failed to update contract status.'),
      );
    }
  },

  // ─── Reviews ─────────────────────────────────────────────────────
  getReviews: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<
        ApiWrapper<{
          reviews: IAdminReview[];
          total: number;
          page: number;
          totalPages: number;
        }>
      >('/admin/reviews', { params: { page, limit } });
      return response.data.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load reviews.'));
    }
  },

  deleteReview: async (id: string) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to delete review.'));
    }
  },
};
