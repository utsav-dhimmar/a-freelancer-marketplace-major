/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  USERS: {
    REGISTER: '/api/users/register',
    LOGIN: '/api/users/login',
    ME: '/api/users/me',
    LOGOUT: '/api/users/logout',
    REFRESH_TOKEN: '/api/users/refresh-token',
    PROFILE_PICTURE: '/api/users/profile-picture',
  },
  FREELANCERS: {
    BASE: '/api/freelancers',
    SEARCH: '/api/freelancers/search',
    ME: '/api/freelancers/me',
    ID: (id: string) => `/api/freelancers/${id}`,
    PORTFOLIO: '/api/freelancers/portfolio',
    PORTFOLIO_INDEX: (index: number) => `/api/freelancers/portfolio/${index}`,
  },
  JOBS: {
    BASE: '/api/jobs',
    SEARCH: '/api/jobs/search',
    MY_JOBS: '/api/jobs/my-jobs',
    ID: (id: string) => `/api/jobs/${id}`,
    STATUS: (id: string) => `/api/jobs/${id}/status`,
  },
  PROPOSALS: {
    BASE: '/api/proposals',
    JOB: (jobId: string) => `/api/proposals/job/${jobId}`,
    MY_PROPOSALS: '/api/proposals/my-proposals',
    ID: (id: string) => `/api/proposals/${id}`,
    STATUS: (id: string) => `/api/proposals/${id}/status`,
  },
  CONTRACTS: {
    BASE: '/api/contracts',
    ID: (id: string) => `/api/contracts/${id}`,
    STATUS: (id: string) => `/api/contracts/${id}/status`,
    SUBMIT: (id: string) => `/api/contracts/${id}/submit`,
    COMPLETE: (id: string) => `/api/contracts/${id}/complete`,
    DISPUTE: (id: string) => `/api/contracts/${id}/dispute`,
  },
} as const;

export const TOKEN = {
  /**
   * HOURS * MINUTES * SECONDS * MILLISECONDS
   * 1 day
   */
  ACCESSTOKEN_MAX_AGE: 24 * 60 * 60 * 1000,
  /**
   * DAYS * HOURS * MINUTES * SECONDS * MILLISECONDS
   * 10 days
   */
  REFRESHTOKEN_MAX_AGE: 10 * 24 * 60 * 60 * 1000,
} as const;
