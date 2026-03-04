import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { proposalApi, jobApi } from '../../api';
import { Card, Button } from '../../components/ui';
import type { IProposal, IJob } from '../../types';

export function JobProposalsPage() {
  const { id } = useParams<{ id: string }>();
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [jobData, proposalsData] = await Promise.all([
        jobApi.getById(id!),
        proposalApi.getByJob(id!),
      ]);
      setJob(jobData);
      setProposals(proposalsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (proposalId: string) => {
    if (!confirm('Are you sure you want to accept this proposal?')) return;
    setActionLoading(proposalId);
    try {
      await proposalApi.accept(proposalId);
      await loadData(); // Reload to get updated status
    } catch (error) {
      console.error('Failed to accept proposal:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    if (!confirm('Are you sure you want to reject this proposal?')) return;
    setActionLoading(proposalId);
    try {
      await proposalApi.reject(proposalId);
      await loadData(); // Reload to get updated status
    } catch (error) {
      console.error('Failed to reject proposal:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'withdrawn':
        return 'secondary';
      default: // pending
        return 'warning';
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-5 text-center">
        <h4>Job not found</h4>
        <Link to="/dashboard/jobs">
          <Button variant="primary" className="mt-3">
            Back to My Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link
        to="/dashboard/jobs"
        className="text-decoration-none mb-4 d-inline-block"
      >
        &larr; Back to My Jobs
      </Link>

      <div className="mb-4">
        <h2>Proposals for: {job.title}</h2>
        <div className="text-muted">
          Budget: ${job.budget}
          {job.budgetType === 'fixed' ? ' (Fixed Price)' : ' (Hourly)'}
        </div>
      </div>

      {proposals.length === 0 ? (
        <Card>
          <div className="text-center py-5">
            <h4 className="text-muted">No proposals received yet</h4>
          </div>
        </Card>
      ) : (
        <div className="row g-4">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="col-12">
              <Card>
                <div className="row">
                  <div className="col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="h5 mb-0">
                        {/* Assuming API populates freelancer details if needed, otherwise just generic info */}
                        Freelancer Proposal
                      </h4>
                      <span
                        className={`badge bg-${getStatusBadgeVariant(proposal.status)}`}
                      >
                        {proposal.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Proposed Amount:</strong> $
                      {proposal.proposedAmount} <br />
                      <strong>Estimated Duration:</strong>{' '}
                      {proposal.estimatedDuration} days
                    </div>
                    <div>
                      <strong>Cover Letter:</strong>
                      <p
                        className="mt-2 text-muted"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {proposal.coverLetter}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4 d-flex flex-column justify-content-center border-start">
                    {proposal.status === 'pending' ? (
                      <div className="d-grid gap-2 p-3">
                        <Button
                          variant="success"
                          onClick={() => handleAccept(proposal._id)}
                          disabled={actionLoading === proposal._id}
                        >
                          {actionLoading === proposal._id
                            ? 'Processing...'
                            : 'Accept Proposal'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleReject(proposal._id)}
                          disabled={actionLoading === proposal._id}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-3 text-muted">
                        This proposal has been {proposal.status}.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
