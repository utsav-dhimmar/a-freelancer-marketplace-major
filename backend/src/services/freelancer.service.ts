import {
  Freelancer,
  type IFreelancer,
  type IPortfolioItem,
} from '../model/freelancer.model.js';

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

export class FreelancerService {
  /**
   * Create a new freelancer profile
   */
  async createFreelancer(data: CreateFreelancerData): Promise<IFreelancer> {
    const freelancer = new Freelancer(data);
    await freelancer.save();
    return freelancer;
  }

  /**
   * Find freelancer by user ID
   */
  async findByUserId(userId: string): Promise<IFreelancer | null> {
    return Freelancer.findOne({ user: userId }).populate(
      'user',
      '-password -refreshToken',
    );
  }

  /**
   * Find freelancer by ID
   */
  async findById(id: string): Promise<IFreelancer | null> {
    return Freelancer.findById(id).populate('user', '-password -refreshToken');
  }

  /**
   * Update freelancer profile
   */
  async updateFreelancer(
    userId: string,
    data: UpdateFreelancerData,
  ): Promise<IFreelancer | null> {
    return Freelancer.findOneAndUpdate(
      { user: userId },
      { $set: data },
      { new: true },
    ).populate('user', '-password -refreshToken');
  }

  /**
   * Delete freelancer profile
   */
  async deleteFreelancer(userId: string): Promise<IFreelancer | null> {
    return Freelancer.findOneAndDelete({ user: userId });
  }

  /**
   * Check if user already has a freelancer profile
   */
  async profileExists(userId: string): Promise<boolean> {
    const freelancer = await Freelancer.findOne({ user: userId });
    return freelancer !== null;
  }

  /**
   * Get all freelancers with pagination
   */
  async getAllFreelancers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    freelancers: IFreelancer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [freelancers, total] = await Promise.all([
      Freelancer.find()
        .populate('user', '-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Freelancer.countDocuments(),
    ]);

    return {
      freelancers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search freelancers by skills
   */
  async searchBySkills(
    skills: string[],
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    freelancers: IFreelancer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = { skills: { $in: skills } };

    const [freelancers, total] = await Promise.all([
      Freelancer.find(query)
        .populate('user', '-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ rating: -1 }),
      Freelancer.countDocuments(query),
    ]);

    return {
      freelancers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(
    userId: string,
    item: IPortfolioItem,
  ): Promise<IFreelancer | null> {
    return Freelancer.findOneAndUpdate(
      { user: userId },
      { $push: { portfolio: item } },
      { new: true },
    ).populate('user', '-password -refreshToken');
  }

  /**
   * Remove portfolio item by index
   */
  async removePortfolioItem(
    userId: string,
    index: number,
  ): Promise<IFreelancer | null> {
    const freelancer = await Freelancer.findOne({ user: userId });
    if (!freelancer || index < 0 || index >= freelancer.portfolio.length) {
      return null;
    }

    freelancer.portfolio.splice(index, 1);
    await freelancer.save();
    return freelancer.populate('user', '-password -refreshToken');
  }

  /**
   * Update rating (called when a job review is submitted)
   */
  async updateRating(
    freelancerId: string,
    newRating: number,
  ): Promise<IFreelancer | null> {
    return Freelancer.findByIdAndUpdate(
      freelancerId,
      { rating: newRating },
      { new: true },
    );
  }

  /**
   * Increment total jobs count
   */
  async incrementTotalJobs(freelancerId: string): Promise<IFreelancer | null> {
    return Freelancer.findByIdAndUpdate(
      freelancerId,
      { $inc: { totalJobs: 1 } },
      { new: true },
    );
  }
}

export const freelancerService = new FreelancerService();
