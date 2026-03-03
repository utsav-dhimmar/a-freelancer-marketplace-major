import axios from 'axios';

import type { AuthResponse, AuthSuccessResponse, User } from '../types/user';
import type { ApiError } from '../types/Api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    role: string;
  }): Promise<AuthSuccessResponse | ApiError | string | undefined> => {
    try {
      const response = await api.post<AuthResponse>('/users/register', data);
      if (response.status === 201) return response.data as AuthSuccessResponse;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        return e.response?.data as ApiError;
      }
      return 'Unable to register please try agian';
    }
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthSuccessResponse>('/users/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/users/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  me: async () => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfilePicture: async (formData: FormData) => {
    const response = await api.post<{ profilePicture: string }>(
      '/users/profile-picture',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },
};
