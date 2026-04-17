import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { proposalApi } from '../../api';
import { Button, Card, Badge, Spinner, EmptyState, Modal } from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import { useAuth } from '../../contexts/AuthContext';
import type { IProposal } from '../../types';

export function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdraw confirmation state
  const [proposalToWithdraw, setProposalToWithdraw] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
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

  const handleWithdraw = (id: string) => {
    setProposalToWithdraw(id);
  };

  const confirmWithdraw = async () => {
    if (!proposalToWithdraw) return;
    setWithdrawing(true);
    try {
      await proposalApi.withdraw(proposalToWithdraw);
      setProposalToWithdraw(null);
      loadProposals();
    } catch (error) {
      console.error('Failed to withdraw proposal:', error);
    } finally {
      setWithdrawing(false);
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
                <div className="d-flex gap-2 mt-3">
                  <Link to={`/dashboard/proposals/${proposal._id}`} className="flex-grow-1">
                    <Button variant="outline-primary" size="sm" className="w-100">
                      View Details
                    </Button>
                  </Link>
                  {proposal.status === 'pending' &&
                    user?.role === 'freelancer' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleWithdraw(proposal._id)}
                      >
                        Withdraw
                      </Button>
                    )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={!!proposalToWithdraw}
        title="Withdraw Proposal"
        variant="confirm"
        confirmText="Yes, Withdraw"
        onClose={() => !withdrawing && setProposalToWithdraw(null)}
        onConfirm={confirmWithdraw}
        isLoading={withdrawing}
      >
        Are you sure you want to withdraw this proposal? This action cannot be undone.
      </Modal>
    </div>
  );
}
