import { Proposal, type IProposal } from '../model/proposals.model.js';

/**
 * Proposal creation data
 */
export interface CreateProposalData {
  job: string;
  freelancer: string;
  coverLetter: string;
  bidAmount: number;
  estimatedTime: string;
}

/**
 * Proposal update data
 */
export interface UpdateProposalData {
  coverLetter?: string;
  bidAmount?: number;
  estimatedTime?: string;
}

export class ProposalService {
  /**
   * Create a new proposal
   */
  async createProposal(data: CreateProposalData): Promise<IProposal> {
    const proposal = new Proposal(data);
    await proposal.save();
    return proposal.populate([
      { path: 'job' },
      { path: 'freelancer', select: '-password -refreshToken' },
    ]);
  }

  /**
   * Find proposal by ID
   */
  async findById(id: string): Promise<IProposal | null> {
    return Proposal.findById(id).populate([
      { path: 'job' },
      { path: 'freelancer', select: '-password -refreshToken' },
    ]);
  }

  /**
   * Get proposals for a job
   */
  async getProposalsByJobId(
    jobId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    proposals: IProposal[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = { job: jobId };

    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate([
          { path: 'job' },
          { path: 'freelancer', select: '-password -refreshToken' },
        ])
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Proposal.countDocuments(query),
    ]);

    return {
      proposals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get proposals by freelancer
   */
  async getProposalsByFreelancer(
    freelancerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    proposals: IProposal[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = { freelancer: freelancerId };

    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate([
          { path: 'job' },
          { path: 'freelancer', select: '-password -refreshToken' },
        ])
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Proposal.countDocuments(query),
    ]);

    return {
      proposals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update proposal
   */
  async updateProposal(
    proposalId: string,
    data: UpdateProposalData,
  ): Promise<IProposal | null> {
    return Proposal.findByIdAndUpdate(
      proposalId,
      { $set: data },
      { new: true },
    ).populate([
      { path: 'job' },
      { path: 'freelancer', select: '-password -refreshToken' },
    ]);
  }

  /**
   * Update proposal status
   */
  async updateProposalStatus(
    proposalId: string,
    status: 'pending' | 'shortlisted' | 'accepted' | 'rejected',
  ): Promise<IProposal | null> {
    return Proposal.findByIdAndUpdate(
      proposalId,
      { status },
      { new: true },
    ).populate([
      { path: 'job' },
      { path: 'freelancer', select: '-password -refreshToken' },
    ]);
  }

  /**
   * Delete proposal
   */
  async deleteProposal(proposalId: string): Promise<IProposal | null> {
    return Proposal.findByIdAndDelete(proposalId);
  }

  /**
   * Check if freelancer already submitted proposal for job
   */
  async hasSubmittedProposal(
    jobId: string,
    freelancerId: string,
  ): Promise<boolean> {
    const proposal = await Proposal.findOne({
      job: jobId,
      freelancer: freelancerId,
    });
    return proposal !== null;
  }

  /**
   * Check if user is proposal owner
   */
  async isProposalOwner(proposalId: string, userId: string): Promise<boolean> {
    const proposal = await Proposal.findById(proposalId);
    return proposal !== null && String(proposal.freelancer) === userId;
  }

  /**
   * Get proposal with job client info
   */
  async getProposalWithJobClient(
    proposalId: string,
  ): Promise<IProposal | null> {
    return Proposal.findById(proposalId).populate([
      {
        path: 'job',
        populate: { path: 'client', select: '-password -refreshToken' },
      },
      { path: 'freelancer', select: '-password -refreshToken' },
    ]);
  }
}

export const proposalService = new ProposalService();
