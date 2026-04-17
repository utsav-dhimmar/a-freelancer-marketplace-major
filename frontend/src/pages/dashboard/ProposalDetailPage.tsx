import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { proposalApi } from '../../api';
import { Button, Card, Badge, Spinner, EmptyState, UserProfileCard, Modal } from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import type { IProposal } from '../../types';

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<IProposal | null>(null);
  const [loading, setLoading] = useState(true);

  // Withdraw confirmation state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (id) {
      loadProposal(id);
    }
  }, [id]);

  const loadProposal = async (proposalId: string) => {
    try {
      const data = await proposalApi.getById(proposalId);
      setProposal(data);
    } catch (error) {
      console.error('Failed to load proposal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    if (!proposal) return;
    setWithdrawing(true);
    try {
      await proposalApi.withdraw(proposal._id);
      setShowWithdrawModal(false);
      navigate('/dashboard/proposals');
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

  if (!proposal) {
    return (
      <div className="container py-5">
        <EmptyState
          title="Proposal not found"
          description="The proposal you are looking for does not exist or you do not have permission to view it."
        >
          <Link to="/dashboard/proposals">
            <Button>Back to My Proposals</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4 d-flex align-items-center">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)} className="me-3">
          &larr; Back
        </Button>
        <h2 className="mb-0">Proposal Details</h2>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Cover Letter</h4>
              {getStatusBadge(proposal.status)}
            </div>
            <div className="proposal-content" style={{ whiteSpace: 'pre-wrap' }}>
              {proposal.coverLetter}
            </div>
          </Card>
        </div>

        <div className="col-md-4 text-start">
          <div className="mb-4">
            <h5 className="mb-3">Freelancer Information</h5>
             <UserProfileCard user={proposal.freelancer} variant="sidebar" />
          </div>

          <div className="mb-4">
            <h5 className="mb-3">Client Information</h5>
             <UserProfileCard user={proposal.job?.client} variant="sidebar" />
          </div>

          <Card className="mb-4">
            <h5 className="mb-3">Job Information</h5>
            <p>
              <strong>Title:</strong><br />
              <Link to={`/jobs/${proposal.job?._id}`}>{proposal.job?.title || 'Unknown Job'}</Link>
            </p>
            <hr />
            <h5 className="mb-3">Your Bid</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Bid Amount:</span>
              <strong>{formatCurrency(proposal.bidAmount)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Estimated Time:</span>
              <strong>{proposal.estimatedTime}</strong>
            </div>
            
            {proposal.status === 'pending' && (
              <Button 
                variant="outline-danger" 
                className="w-100 mt-3"
                onClick={handleWithdraw}
              >
                Withdraw Proposal
              </Button>
            )}
          </Card>

          {proposal.status === 'accepted' && (
             <Card className="bg-light border-success">
                <p className="mb-0 text-success">
                  <strong>Congratulations!</strong> Your proposal has been accepted. 
                  Go to <Link to="/dashboard/contracts">Contracts</Link> to start working.
                </p>
             </Card>
          )}
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={showWithdrawModal}
        title="Withdraw Proposal"
        variant="confirm"
        confirmText="Yes, Withdraw"
        onClose={() => !withdrawing && setShowWithdrawModal(false)}
        onConfirm={confirmWithdraw}
        isLoading={withdrawing}
      >
        Are you sure you want to withdraw this proposal? This action cannot be undone.
      </Modal>
    </div>
  );
}
