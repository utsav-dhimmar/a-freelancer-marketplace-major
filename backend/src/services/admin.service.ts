import { Contract } from '../model/contracts.model.js';
import { Freelancer } from '../model/freelancer.model.js';
import { Job, type IJob } from '../model/job.model.js';
import { Proposal } from '../model/proposals.model.js';
import { Review, type IReview } from '../model/review.model.js';
import { User, type IUser } from '../model/user.model.js';
import type { IContract } from '../model/contracts.model.js';

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

export class AdminService {
  /**
   * Find or create the admin user in the database.
   * On first admin login, auto-creates the admin user in MongoDB.
   */
  async findOrCreateAdmin(email: string, password: string): Promise<IUser> {
    let admin = await User.findOne({ email: email.toLowerCase() });

    if (!admin) {
      // Auto-create admin user on first login
      admin = new User({
        username: 'admin',
        fullname: 'Administrator',
        email: email.toLowerCase(),
        password,
        role: 'admin',
      });
      await admin.save();
    }

    return admin;
  }

  /**
   * Get aggregated dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      clientCount,
      freelancerCount,
      adminCount,
      totalJobs,
      openJobs,
      inProgressJobs,
      completedJobs,
      cancelledJobs,
      totalContracts,
      activeContracts,
      submittedContracts,
      completedContracts,
      disputedContracts,
      totalProposals,
      pendingProposals,
      acceptedProposals,
      rejectedProposals,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'in_progress' }),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'cancelled' }),
      Contract.countDocuments(),
      Contract.countDocuments({ status: 'active' }),
      Contract.countDocuments({ status: 'submitted' }),
      Contract.countDocuments({ status: 'completed' }),
      Contract.countDocuments({ status: 'disputed' }),
      Proposal.countDocuments(),
      Proposal.countDocuments({ status: 'pending' }),
      Proposal.countDocuments({ status: 'accepted' }),
      Proposal.countDocuments({ status: 'rejected' }),
      Review.countDocuments(),
    ]);

    return {
      users: {
        total: totalUsers,
        clients: clientCount,
        freelancers: freelancerCount,
        admins: adminCount,
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
        cancelled: cancelledJobs,
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
        submitted: submittedContracts,
        completed: completedContracts,
        disputed: disputedContracts,
      },
      proposals: {
        total: totalProposals,
        pending: pendingProposals,
        accepted: acceptedProposals,
        rejected: rejectedProposals,
      },
      reviews: {
        total: totalReviews,
      },
    };
  }

  // ─── User Management ───────────────────────────────────────────

  /**
   * Get all users with pagination and optional filters
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    const [users, total] = await Promise.all([
      User.find()
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single user by ID (without password)
   */
  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password -refreshToken');
  }

  /**
   * Update a user's profile or role
   */
  async updateUser(
    id: string,
    data: {
      role?: 'client' | 'admin' | 'freelancer';
      fullname?: string;
      email?: string;
      username?: string;
    },
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true }).select(
      '-password -refreshToken',
    );
  }

  /**
   * Delete a user and their freelancer profile (if any)
   */
  async deleteUser(id: string): Promise<IUser | null> {
    // Also remove the freelancer profile linked to this user
    await Freelancer.findOneAndDelete({ user: id });
    return User.findByIdAndDelete(id);
  }

  // ─── Job Management ────────────────────────────────────────────

  /**
   * Get all jobs (any status) with pagination and optional filters
   */
  async getAllJobs(
    page: number = 1,
    limit: number = 10,
    filters?: AdminJobFilters,
  ): Promise<{
    jobs: IJob[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
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
   * Admin force-delete a job and its related proposals
   */
  async deleteJob(id: string): Promise<IJob | null> {
    await Proposal.deleteMany({ job: id });
    return Job.findByIdAndDelete(id);
  }

  // ─── Contract Management ───────────────────────────────────────

  /**
   * Get all contracts with pagination
   */
  async getAllContracts(
    page: number = 1,
    limit: number = 10,
    filters?: AdminContractFilters,
  ): Promise<{
    contracts: IContract[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate('client', '-password -refreshToken')
        .populate('freelancer', '-password -refreshToken')
        .populate('job', 'title status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Contract.countDocuments(query),
    ]);

    return {
      contracts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin override contract status (e.g. resolve disputes)
   */
  async updateContractStatus(
    id: string,
    status: 'active' | 'submitted' | 'completed' | 'disputed',
  ): Promise<IContract | null> {
    return Contract.findByIdAndUpdate(id, { status }, { new: true })
      .populate('client', '-password -refreshToken')
      .populate('freelancer', '-password -refreshToken')
      .populate('job', 'title status');
  }

  // ─── Review Management ─────────────────────────────────────────

  /**
   * Get all reviews with pagination
   */
  async getAllReviews(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    reviews: IReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('reviewer', 'username fullname email profilePicture')
        .populate('reviewee', 'username fullname email profilePicture')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments(),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin delete a review
   */
  async deleteReview(id: string): Promise<IReview | null> {
    return Review.findByIdAndDelete(id);
  }
}

export const adminService = new AdminService();
