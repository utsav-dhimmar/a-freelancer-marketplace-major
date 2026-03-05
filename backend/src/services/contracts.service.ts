import { Contract, type IContract } from '../model/contracts.model.js';
import { Proposal } from '../model/proposals.model.js';
import { Job } from '../model/job.model.js';
import type { CreateContractData } from '../types/contract.types.js';

export class ContractService {
  /**
   * Create a new contract
   */
  async createContract(data: CreateContractData): Promise<IContract> {
    const contract = new Contract({
      ...data,
      startDate: new Date(),
    });
    await contract.save();
    return contract.populate([
      { path: 'job' },
      { path: 'client', select: '-password -refreshToken' },
      { path: 'freelancer', select: '-password -refreshToken' },
      { path: 'proposal' },
    ]);
  }

  /**
   * Find contract by ID
   */
  async findById(id: string): Promise<IContract | null> {
    return Contract.findById(id).populate([
      { path: 'job' },
      { path: 'client', select: '-password -refreshToken' },
      { path: 'freelancer', select: '-password -refreshToken' },
      { path: 'proposal' },
    ]);
  }

  /**
   * Get contracts for a user (as client or freelancer)
   */
  async getContractsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    contracts: IContract[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = {
      $or: [{ client: userId }, { freelancer: userId }],
    };

    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate([
          { path: 'job' },
          { path: 'client', select: '-password -refreshToken' },
          { path: 'freelancer', select: '-password -refreshToken' },
          { path: 'proposal' },
        ])
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
   * Update contract status
   */
  async updateContractStatus(
    contractId: string,
    status: 'active' | 'submitted' | 'completed' | 'disputed',
  ): Promise<IContract | null> {
    const updateData: { status: string; endDate?: Date } = { status };
    if (status === 'completed') {
      updateData.endDate = new Date();
    }

    return Contract.findByIdAndUpdate(contractId, updateData, {
      new: true,
    }).populate([
      { path: 'job' },
      { path: 'client', select: '-password -refreshToken' },
      { path: 'freelancer', select: '-password -refreshToken' },
      { path: 'proposal' },
    ]);
  }

  /**
   * Check if user is a party in the contract
   */
  async isContractParty(contractId: string, userId: string): Promise<boolean> {
    const contract = await Contract.findById(contractId);
    if (!contract) return false;
    return (
      String(contract.client) === userId ||
      String(contract.freelancer) === userId
    );
  }

  /**
   * Check if user is the client in the contract
   */
  async isContractClient(contractId: string, userId: string): Promise<boolean> {
    const contract = await Contract.findById(contractId);
    return contract !== null && String(contract.client) === userId;
  }

  /**
   * Check if user is the freelancer in the contract
   */
  async isContractFreelancer(
    contractId: string,
    userId: string,
  ): Promise<boolean> {
    const contract = await Contract.findById(contractId);
    return contract !== null && String(contract.freelancer) === userId;
  }

  /**
   * Check if contract already exists for a proposal
   */
  async contractExistsForProposal(proposalId: string): Promise<boolean> {
    const contract = await Contract.findOne({ proposal: proposalId });
    return contract !== null;
  }

  /**
   * Automatically create contracts for all accepted proposals where the job is in_progress
   */
  async createContractsForAcceptedProposals(): Promise<{
    created: number;
    skipped: number;
  }> {
    const acceptedProposals = await Proposal.find({ status: 'accepted' });
    let createdCount = 0;
    let skippedCount = 0;

    for (const proposal of acceptedProposals) {
      const job = await Job.findById(proposal.job);

      if (!job || job.status !== 'in_progress') {
        skippedCount++;
        continue;
      }

      const contractExists = await this.contractExistsForProposal(
        String(proposal._id),
      );
      if (contractExists) {
        skippedCount++;
        continue;
      }

      await this.createContract({
        job: String(job._id),
        client: String(job.client),
        freelancer: String(proposal.freelancer),
        proposal: String(proposal._id),
        amount: proposal.bidAmount,
      });

      createdCount++;
    }

    return { created: createdCount, skipped: skippedCount };
  }
}

export const contractService = new ContractService();
