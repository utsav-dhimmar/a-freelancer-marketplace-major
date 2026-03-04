/**
 * Dashboard statistics shape
 */
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

/**
 * Job list filters for admin
 */
export interface AdminJobFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled' | undefined;
  search?: string | undefined;
}

/**
 * Contract list filters for admin
 */
export interface AdminContractFilters {
  status?: 'active' | 'submitted' | 'completed' | 'disputed' | undefined;
}
