import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proposalApi, jobApi } from '../../api';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { IProposal, IJob } from '../../types';

export function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [jobs, setJobs] = useState<Record<string, IJob>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await proposalApi.getMyProposals();
      setProposals(data);
      const jobIds = [...new Set(data.map((p) => p.job._id))];

      const jobResults = await Promise.all(jobIds.map((id) => jobApi.getById(id)));
      const jobData = Object.fromEntries(jobResults.map((job) => [job._id, job]));

      setJobs(jobData);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this proposal?')) return;
    try {
      await proposalApi.withdraw(id);
      loadProposals();
    } catch (error) {
      console.error('Failed to withdraw proposal:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'bg-warning',
      accepted: 'bg-success',
      rejected: 'bg-danger',
      withdrawn: 'bg-secondary',
    };
    return (
      <span className={`badge ${classes[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Proposals</h2>

      {proposals.length === 0 ? (
        <Card>
          <p className="text-muted mb-0 text-center">
            You haven't submitted any proposals yet.
          </p>
          <div className="text-center mt-3">
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="row">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="col-md-6 mb-4">
              <Card>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">
                    {jobs[proposal.jobId]?.title || 'Job'}
                  </h5>
                  {getStatusBadge(proposal.status)}
                </div>
                <p
                  className="text-muted mb-3"
                  style={{ maxHeight: '3rem', overflow: 'hidden' }}
                >
                  {proposal.coverLetter.substring(0, 100)}...
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Amount: </small>
                    <strong>${proposal.proposedAmount}</strong>
                    <small className="text-muted">
                      {' '}
                      | Duration: {proposal.estimatedDuration} days
                    </small>
                  </div>
                </div>
                {proposal.status === 'pending' &&
                  user?.role === 'freelancer' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleWithdraw(proposal._id)}
                    >
                      Withdraw
                    </Button>
                  )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
