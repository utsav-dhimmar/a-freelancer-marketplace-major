import type { IPortfolioItem } from '../model/freelancer.model.js';

/**
 * Freelancer profile creation data
 */
export interface CreateFreelancerData {
  user: string;
  title: string;
  bio?: string;
  skills?: string[];
  hourlyRate: number;
  portfolio?: IPortfolioItem[];
}

/**
 * Freelancer profile update data
 */
export interface UpdateFreelancerData {
  title?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  portfolio?: IPortfolioItem[];
}
