import type { IJob } from './index';

export interface DashboardStats {
  users: {
    total: number;
    clients: number;
    freelancers: number;
    admins: number;
  };
  jobs: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  contracts: {
    total: number;
    active: number;
    submitted: number;
    completed: number;
    disputed: number;
  };
  proposals: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  reviews: {
    total: number;
  };
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  [key: string]: T[] | number;
}

export interface AdminJobFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  search?: string;
}

export interface AdminContractFilters {
  status?: 'active' | 'submitted' | 'completed' | 'disputed';
}

export interface IAdminReview {
  _id: string;
  reviewer: {
    _id: string;
    username: string;
    fullname: string;
    email: string;
    profilePicture?: string;
  };
  reviewee: {
    _id: string;
    username: string;
    fullname: string;
    email: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminJob extends Omit<IJob, 'client'> {
  client?: {
    _id: string;
    username: string;
    fullname: string;
    email: string;
  };
}

export interface IAdminContract {
  _id: string;
  client: {
    _id: string;
    username: string;
    fullname: string;
    email: string;
  };
  freelancer: {
    _id: string;
    username: string;
    fullname: string;
    email: string;
  };
  job: {
    _id: string;
    title: string;
    status: string;
  };
  amount: number;
  status: 'active' | 'submitted' | 'completed' | 'disputed';
  startDate: string;
  endDate?: string;
  workSubmitted?: string;
  createdAt: string;
  updatedAt: string;
}
