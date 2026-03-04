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
