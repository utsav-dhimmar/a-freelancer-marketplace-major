import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { proposalApi } from '../../api';
import { Button, Card, Badge, Spinner, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import { useAuth } from '../../contexts/AuthContext';
import type { IProposal } from '../../types';

export function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(true);
  console.log(proposals);
  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await proposalApi.getMyProposals();
      setProposals(data);
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
    const variants: Record<
      string,
      'primary' | 'secondary' | 'success' | 'danger' | 'warning'
    > = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      withdrawn: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Proposals</h2>

      {proposals.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="You haven't submitted any proposals yet."
        >
          <div className="text-center mt-3">
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        </EmptyState>
      ) : (
        <div className="row">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="col-md-6 mb-4">
              <Card>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{proposal.job?.title || 'Job'}</h5>
                  {getStatusBadge(proposal.status)}
                </div>
                <p
                  className="text-muted mb-3"
                  style={{
                    maxHeight: '3rem',
                    overflow: 'hidden',
                  }}
                >
                  {proposal.coverLetter.substring(0, 100)}...
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Amount: </small>
                    <strong>{formatCurrency(proposal.bidAmount)}</strong>
                    <small className="text-muted">
                      {' '}
                      | Estimated Time: {proposal.estimatedTime}
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
