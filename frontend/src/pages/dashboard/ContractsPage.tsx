import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractApi, reviewApi } from '../../api';
import {
  Badge,
  Button,
  Card,
  DateDisplay,
  EmptyState,
  Spinner,
  TextArea,
  StarRating,
  UserProfileCard,
  Modal,
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
  const [contractReviews, setContractReviews] = useState<Record<string, IReview[]>>(
    {},
  );

  // New Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contractToComplete, setContractToComplete] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await contractApi.getMyContracts();
      setContracts(data);

      // Fetch reviews for completed contracts
      const completedContracts = data.filter(
        (c: IContract) => c.status === 'completed',
      );
      const reviewsMap: Record<string, IReview[]> = {};
      for (const c of completedContracts) {
        try {
          const reviews = await reviewApi.getByContract(c._id);
          reviewsMap[c._id] = reviews;
        } catch (error) {
          console.error(`Failed to load reviews for contract ${c._id}:`, error);
        }
      }
      setContractReviews(reviewsMap);
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

  const handleComplete = (id: string) => {
    setContractToComplete(id);
    setShowConfirmModal(true);
  };

  const confirmComplete = async () => {
    if (!contractToComplete) return;

    try {
      await contractApi.completeContract(contractToComplete);
      loadContracts();
    } catch (error) {
      console.error('Failed to complete contract:', error);
    } finally {
      setShowConfirmModal(false);
      setContractToComplete(null);
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
      const newReview = await reviewApi.create({
        contractId: reviewContract._id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });

      // Update local state with the new review
      setContractReviews((prev) => ({
        ...prev,
        [reviewContract._id]: [...(prev[reviewContract._id] || []), newReview],
      }));

      setReviewContract(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit review';
      setAlertConfig({ title: 'Submission Error', message: msg });
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
      submitted: 'warning',
      completed: 'success',
      disputed: 'danger',
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
                  <h5 className="mb-0">{contract.job.title}</h5>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="mb-3">
                  <small className="text-muted">Amount: </small>
                  <strong>{formatCurrency(contract.amount)}</strong>
                  <small className="text-muted">
                    {' '}
                    | Started: <DateDisplay date={contract.startDate} />
                  </small>
                </div>

                <div className="mb-3">
                  <UserProfileCard
                    user={user?.role === 'client' ? contract.freelancer : contract.client}
                    variant="mini"
                  />
                </div>
                {contract.workSubmitted && (
                  <div className="mb-3">
                    <small className="text-muted">Work Submitted:</small>
                    <p className="mb-0 small">{contract.workSubmitted}</p>
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() =>
                      navigate(`/dashboard/contracts/${contract._id}/chat`)
                    }
                  >
                    💬 Chat
                  </Button>

                  {/* Actions for Active / Submitted contracts */}
                  {(contract.status === 'active' ||
                    contract.status === 'submitted') && (
                      <>
                        {/* Freelancer: Submit work (only if active) */}
                        {user?.role !== 'client' && contract.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedContract(contract)}
                          >
                            Submit Work
                          </Button>
                        )}

                        {/* Client: Mark Complete (only if submitted) */}
                        {user?.role === 'client' && contract.status === 'submitted' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleComplete(contract._id)}
                          >
                            Mark Complete
                          </Button>
                        )}

                        {/* Both: Raise Dispute */}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            setSelectedContract({
                              ...contract,
                              status: 'disputed',
                            } as any);
                          }}
                        >
                          Raise Dispute
                        </Button>
                      </>
                    )}

                  {contract.status === 'completed' && (
                    <div className="w-100 mt-2">
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {/* Show "Leave Review" button only if I haven't reviewed yet */}
                        {!(contractReviews[contract._id] || []).some((r) => {
                          const reviewerId =
                            typeof r.reviewer === 'object'
                              ? r.reviewer._id || r.reviewer.id
                              : r.reviewer;
                          const currentUserId = user?._id || user?.id;
                          return String(reviewerId) === String(currentUserId);
                        }) ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setReviewContract(contract);
                              setReviewRating(5);
                              setReviewComment('');
                            }}
                          >
                            ⭐ Leave Review
                          </Button>
                        ) : (
                          <span className="text-success small d-flex align-items-center">
                            ✓ You have reviewed
                          </span>
                        )}
                      </div>

                      {/* Display reviews if any exist */}
                      {(contractReviews[contract._id] || []).length > 0 && (
                        <div className="bg-light p-3 rounded border">
                          <h6 className="small fw-bold mb-2">Reviews:</h6>
                          {(contractReviews[contract._id] || []).map((r) => {
                            const reviewerId =
                              typeof r.reviewer === 'object'
                                ? r.reviewer._id || r.reviewer.id
                                : r.reviewer;
                            const currentUserId = user?._id || user?.id;
                            const isMyReview =
                              String(reviewerId) === String(currentUserId);
                            return (
                              <div
                                key={r._id}
                                className={`mb-2 pb-2 ${isMyReview ? 'border-bottom-0' : 'border-bottom'
                                  }`}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="small fw-semibold">
                                    {typeof r.reviewer === 'object'
                                      ? `${r.reviewer.role.charAt(0).toUpperCase() +
                                      r.reviewer.role.slice(1)
                                      }: ${r.reviewer.fullname || r.reviewer.username
                                      }`
                                      : 'User'}{' '}
                                    {isMyReview && '(You)'}
                                  </span>
                                  <StarRating value={r.rating} readonly size="sm" />
                                </div>
                                {r.comment && (
                                  <p className="mb-0 small text-muted fst-italic">
                                    "{r.comment}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {contract.status === 'disputed' && (
                    <div className="w-100 p-2 mt-2 bg-light border border-danger rounded text-danger small">
                      <strong>⚠️ Contract is disputed.</strong> Please chat with
                      each other and solve the dispute before leaving a review.
                    </div>
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        title="Confirm Completion"
        variant="confirm"
        confirmText="Yes, Complete"
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmComplete}
      >
        Are you sure you want to mark this contract as completed?
      </Modal>

      {/* Alert Modal */}
      <Modal
        isOpen={!!alertConfig}
        title={alertConfig?.title || 'Alert'}
        onClose={() => setAlertConfig(null)}
      >
        {alertConfig?.message}
      </Modal>
    </div>
  );
}
