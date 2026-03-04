/**
 * Job creation data
 */
export interface CreateJobData {
  client: string;
  title: string;
  description: string;
  difficulty: 'entry' | 'intermediate' | 'expert';
  budget: number;
  budgetType: 'fixed' | 'hourly';
  skillsRequired?: string[];
  deadline?: Date;
}

/**
 * Job update data
 */
export interface UpdateJobData {
  title?: string;
  description?: string;
  difficulty?: 'entry' | 'intermediate' | 'expert';
  budget?: number;
  budgetType?: 'fixed' | 'hourly';
  skillsRequired?: string[];
  deadline?: Date;
}

/**
 * Job search filters
 */
export interface JobSearchFilters {
  skills?: string[];
  difficulty?: 'entry' | 'intermediate' | 'expert';
  budgetType?: 'fixed' | 'hourly';
  minBudget?: number;
  maxBudget?: number;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
}
