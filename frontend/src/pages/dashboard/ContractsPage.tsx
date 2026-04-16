import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractApi, reviewApi } from '../../api';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
  TextArea,
} from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import { useAuth } from '../../contexts/AuthContext';
import type { IContract } from '../../types';

export function ContractsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<IContract | null>(
    null,
  );
  const [workDescription, setWorkDescription] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review state
  const [reviewContract, setReviewContract] = useState<IContract | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedContracts, setReviewedContracts] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await contractApi.getMyContracts();
      setContracts(data);

      // Check which completed contracts have already been reviewed
      const completedContracts = data.filter(
        (c: IContract) => c.status === 'completed',
      );
      const reviewed = new Set<string>();
      for (const c of completedContracts) {
        try {
          const hasReviewed = await reviewApi.checkReviewed(c._id);
          if (hasReviewed) reviewed.add(c._id);
        } catch {}
      }
      setReviewedContracts(reviewed);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    setSubmitting(true);
    try {
      await contractApi.submitWork(selectedContract._id, workDescription);
      setSelectedContract(null);
      setWorkDescription('');
      loadContracts();
    } catch (error) {
      console.error('Failed to submit work:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Are you sure you want to mark this contract as completed?'))
      return;
    try {
      await contractApi.completeContract(id);
      loadContracts();
    } catch (error) {
      console.error('Failed to complete contract:', error);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    setSubmitting(true);
    try {
      await contractApi.raiseDispute(selectedContract._id, disputeReason);
      setSelectedContract(null);
      setDisputeReason('');
      loadContracts();
    } catch (error) {
      console.error('Failed to raise dispute:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContract) return;

    setReviewSubmitting(true);
    try {
      await reviewApi.create({
        contractId: reviewContract._id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      setReviewedContracts((prev) => new Set(prev).add(reviewContract._id));
      setReviewContract(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit review';
      alert(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'primary' | 'secondary' | 'success' | 'danger' | 'warning'
    > = {
      active: 'primary',
      completed: 'success',
      disputed: 'danger',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  /** Star rating picker component */
  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div style={{ display: 'flex', gap: 4, cursor: 'pointer', fontSize: 28 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            color: star <= value ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
          }}
          role="button"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner />
      </div>
    );
  }
  console.log(contracts);
  return (
    <div className="container py-4">
      <h2 className="mb-4">My Contracts</h2>

      {contracts.length === 0 ? (
        <EmptyState
          title="No contracts yet"
          description="You don't have any contracts yet."
        />
      ) : (
        <div className="row">
          {contracts.map((contract) => (
            <div key={contract._id} className="col-md-6 mb-4">
              <Card>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">
                    {/*{jobs[contract.jobId]?.title || "Job"}*/}
                    {/*TODO FIX IT*/}
                    {contract.job.title}
                  </h5>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="mb-3">
                  <small className="text-muted">Amount: </small>
                  <strong>{formatCurrency(contract.amount)}</strong>
                  <small className="text-muted">
                    {' '}
                    | Started:{' '}
                    {new Date(contract.startDate).toLocaleDateString()}
                  </small>
                </div>
                {contract.workSubmitted && (
                  <div className="mb-3">
                    <small className="text-muted">Work Submitted:</small>
                    <p className="mb-0 small">{contract.workSubmitted}</p>
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  {contract.status === 'active' && (
                    <>
                      {user?.role !== 'client' && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedContract(contract)}
                        >
                          Submit Work
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          navigate(`/dashboard/contracts/${contract._id}/chat`)
                        }
                      >
                        💬 Chat
                      </Button>
                      {user?.role === 'client' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleComplete(contract._id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </>
                  )}
                  {contract.status === 'completed' && (
                    <>
                      <span className="text-success">
                        ✅ Contract completed
                      </span>
                      {!reviewedContracts.has(contract._id) ? (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => {
                            setReviewContract(contract);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                        >
                          ⭐ Leave Review
                        </Button>
                      ) : (
                        <span
                          className="text-muted small"
                          style={{
                            alignSelf: 'center',
                          }}
                        >
                          ✓ Reviewed
                        </span>
                      )}
                    </>
                  )}
                  {contract.status === 'disputed' && (
                    <span className="text-danger">Under dispute</span>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Submit Work / Dispute Modal */}
      {selectedContract && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedContract.status === 'active'
                    ? 'Submit Work'
                    : 'Raise Dispute'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedContract(null)}
                />
              </div>
              <div className="modal-body">
                {selectedContract.status === 'active' ? (
                  <form onSubmit={handleSubmitWork}>
                    <TextArea
                      label="Work Description"
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="d-flex gap-2">
                      <Button type="submit" isLoading={submitting}>
                        Submit
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSelectedContract(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleDispute}>
                    <TextArea
                      label="Reason for Dispute"
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="d-flex gap-2">
                      <Button type="submit" isLoading={submitting}>
                        Submit Dispute
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSelectedContract(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewContract && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">⭐ Leave a Review</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewContract(null)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rating</label>
                    <StarRating
                      value={reviewRating}
                      onChange={setReviewRating}
                    />
                  </div>
                  <TextArea
                    label="Comment (optional)"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="d-flex gap-2 mt-2">
                    <Button type="submit" isLoading={reviewSubmitting}>
                      Submit Review
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setReviewContract(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
