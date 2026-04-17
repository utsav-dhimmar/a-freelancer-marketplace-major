import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Proposal } from '../model/proposals.model.js';
import { ProposalService } from './proposals.service.ts';

vi.mock('../model/proposals.model.js', () => ({
  Proposal: {
    find: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

describe('ProposalService', () => {
  let proposalService: ProposalService;

  beforeEach(() => {
    vi.clearAllMocks();
    proposalService = new ProposalService();
  });

  describe('findById', () => {
    it('should find proposal and populate job and freelancer', async () => {
      const id = 'prop-123';
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id, coverLetter: 'Hello' }),
      };
      vi.mocked(Proposal.findById).mockReturnValue(mockQuery as any);

      const result = await proposalService.findById(id);

      expect(Proposal.findById).toHaveBeenCalledWith(id);
      expect(mockQuery.populate).toHaveBeenCalled();
      expect(result?._id).toBe(id);
    });
  });

  describe('getProposalsByJobId', () => {
    it('should return paginated proposals for a job', async () => {
      const jobId = 'job-123';
      const mockProposals = [{ coverLetter: 'P1' }, { coverLetter: 'P2' }];
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockProposals),
      };
      vi.mocked(Proposal.find).mockReturnValue(mockQuery as any);
      vi.mocked(Proposal.countDocuments).mockResolvedValue(2);

      const result = await proposalService.getProposalsByJobId(jobId, 1, 10);

      expect(Proposal.find).toHaveBeenCalledWith({ job: jobId });
      expect(result.proposals).toEqual(mockProposals);
      expect(result.total).toBe(2);
    });
  });

  describe('getProposalsByFreelancer', () => {
    it('should return proposals submitted by a freelancer', async () => {
      const freelancerId = 'free-123';
      const mockProposals = [{ coverLetter: 'P1' }];
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockProposals),
      };
      vi.mocked(Proposal.find).mockReturnValue(mockQuery as any);
      vi.mocked(Proposal.countDocuments).mockResolvedValue(1);

      const result = await proposalService.getProposalsByFreelancer(freelancerId, 1, 10);

      expect(Proposal.find).toHaveBeenCalledWith({ freelancer: freelancerId });
      expect(result.proposals).toEqual(mockProposals);
    });
  });

  describe('updateProposalStatus', () => {
    it('should update status and return populated proposal', async () => {
      const id = 'prop-123';
      const status = 'accepted';
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id, status }),
      };
      vi.mocked(Proposal.findByIdAndUpdate).mockReturnValue(mockQuery as any);

      const result = await proposalService.updateProposalStatus(id, status);

      expect(Proposal.findByIdAndUpdate).toHaveBeenCalledWith(id, { status }, { new: true });
      expect(result?.status).toBe(status);
    });
  });

  describe('updateProposal', () => {
    it('should update proposal and return populated result', async () => {
      const id = 'prop-123';
      const data = { coverLetter: 'Updated' };
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id, ...data }),
      };
      vi.mocked(Proposal.findByIdAndUpdate).mockReturnValue(mockQuery as any);

      const result = await proposalService.updateProposal(id, data as any);

      expect(Proposal.findByIdAndUpdate).toHaveBeenCalledWith(id, { $set: data }, { new: true });
      expect(result?.coverLetter).toBe('Updated');
    });
  });

  describe('deleteProposal', () => {
    it('should delete proposal by ID', async () => {
      const id = 'prop-123';
      vi.mocked(Proposal.findByIdAndDelete).mockResolvedValue({ _id: id });
      const result = await proposalService.deleteProposal(id);
      expect(Proposal.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBeDefined();
    });
  });

  describe('isProposalOwner', () => {
    it('should return true if user is the freelancer', async () => {
      const id = 'prop-123';
      const userId = 'user-123';
      vi.mocked(Proposal.findById).mockResolvedValue({ freelancer: userId } as any);
      const isOwner = await proposalService.isProposalOwner(id, userId);
      expect(isOwner).toBe(true);
    });
  });

  describe('getProposalWithJobClient', () => {
    it('should return proposal with nested client population', async () => {
      const id = 'prop-123';
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id }),
      };
      vi.mocked(Proposal.findById).mockReturnValue(mockQuery as any);

      const result = await proposalService.getProposalWithJobClient(id);

      expect(Proposal.findById).toHaveBeenCalledWith(id);
      expect(mockQuery.populate).toHaveBeenCalled();
      expect(result?._id).toBe(id);
    });
  });

  describe('hasSubmittedProposal', () => {
    it('should return true if proposal exists', async () => {
      vi.mocked(Proposal.findOne).mockResolvedValue({ _id: 'prop-1' });
      const exists = await proposalService.hasSubmittedProposal('job-1', 'free-1');
      expect(exists).toBe(true);
      expect(Proposal.findOne).toHaveBeenCalledWith({ job: 'job-1', freelancer: 'free-1' });
    });

    it('should return false if proposal does not exist', async () => {
      vi.mocked(Proposal.findOne).mockResolvedValue(null);
      const exists = await proposalService.hasSubmittedProposal('job-1', 'free-1');
      expect(exists).toBe(false);
    });
  });
});
