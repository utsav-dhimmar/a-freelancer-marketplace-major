export type UserRole = 'client' | 'admin' | 'freelancer';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type ContractStatus = 'active' | 'completed' | 'disputed' | 'cancelled';

export type BudgetType = 'fixed' | 'hourly';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  name?: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IJob {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  skillsRequired: string[];
  budgetType: BudgetType;
  budgetAmount: number;
  deadline: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IFreelancer {
  _id: string;
  userId: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  portfolio: IPortfolioItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IPortfolioItem {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
}

export interface IProposal {
  _id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  proposedAmount: number;
  estimatedDuration: number;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IContract {
  _id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  proposalId: string;
  amount: number;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  workSubmitted?: string;
  createdAt: string;
  updatedAt: string;
}
