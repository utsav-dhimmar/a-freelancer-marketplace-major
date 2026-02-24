import { Job, type IJob } from '../model/job.model.js';

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

export class JobService {
  /**
   * Create a new job
   */
  async createJob(data: CreateJobData): Promise<IJob> {
    const job = new Job(data);
    await job.save();
    return job.populate('client', '-password -refreshToken');
  }

  /**
   * Find job by ID
   */
  async findById(id: string): Promise<IJob | null> {
    return Job.findById(id).populate('client', '-password -refreshToken');
  }

  /**
   * Get all open jobs with pagination
   */
  async getAllJobs(
    page: number = 1,
    limit: number = 10,
    status: string = 'open',
  ): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('client', '-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Job.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get jobs posted by a client
   */
  async getJobsByClient(
    clientId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = { client: clientId };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('client', '-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Job.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search jobs with filters
   */
  async searchJobs(
    filters: JobSearchFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    // Default to open jobs
    query.status = filters.status || 'open';

    if (filters.skills && filters.skills.length > 0) {
      query.skillsRequired = { $in: filters.skills };
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.budgetType) {
      query.budgetType = filters.budgetType;
    }

    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      query.budget = {};
      if (filters.minBudget !== undefined) {
        (query.budget as Record<string, number>).$gte = filters.minBudget;
      }
      if (filters.maxBudget !== undefined) {
        (query.budget as Record<string, number>).$lte = filters.maxBudget;
      }
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('client', '-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Job.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update job
   */
  async updateJob(jobId: string, data: UpdateJobData): Promise<IJob | null> {
    return Job.findByIdAndUpdate(jobId, { $set: data }, { new: true }).populate(
      'client',
      '-password -refreshToken',
    );
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string,
    status: 'open' | 'in_progress' | 'completed' | 'cancelled',
  ): Promise<IJob | null> {
    return Job.findByIdAndUpdate(jobId, { status }, { new: true }).populate(
      'client',
      '-password -refreshToken',
    );
  }

  /**
   * Delete job
   */
  async deleteJob(jobId: string): Promise<IJob | null> {
    return Job.findByIdAndDelete(jobId);
  }

  /**
   * Check if user is job owner
   */
  async isJobOwner(jobId: string, userId: string): Promise<boolean> {
    const job = await Job.findById(jobId);
    return job !== null && String(job.client) === userId;
  }
}

export const jobService = new JobService();
