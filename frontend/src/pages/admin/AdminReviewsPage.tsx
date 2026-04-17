import { useEffect, useState, useCallback } from 'react';
import {
  AdminLayout,
  AdminPagination,
  AdminToast,
  AdminLoading,
  AdminEmpty,
  AdminModal,
} from './components';
import type { Toast } from './components';
import { adminApi } from '../../api/admin';
import type { IAdminReview } from '../../types/admin';
import { Button } from '../../components/ui';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-warning">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'me-1' : 'me-1 opacity-25 text-secondary'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

let toastId = 0;

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<IAdminReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Delete confirmation
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReviews(page, 10);
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load reviews',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteClick = (id: string) => {
    setReviewToDelete(id);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteReview(reviewToDelete);
      showToast('Review deleted successfully', 'success');
      setReviewToDelete(null);
      fetchReviews();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete review',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <AdminLayout title="Review Management">
      <AdminToast toasts={toasts} />

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="mb-0 fw-bold text-dark">All Reviews ({total})</h5>
        </div>

        {loading ? (
          <AdminLoading message="Loading reviews..." />
        ) : reviews.length === 0 ? (
          <div className="p-4">
            <AdminEmpty message="No reviews found" />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-uppercase small fw-bold text-muted px-4 py-3">
                      Reviewer
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Reviewee
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Rating
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Comment
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Date
                    </th>
                    <th className="text-uppercase small fw-bold text-muted px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">
                          {review.reviewer?.username || '—'}
                        </div>
                        <div className="small text-muted">
                          {review.reviewer?.email || ''}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">
                          {review.reviewee?.username || '—'}
                        </div>
                        <div className="small text-muted">
                          {review.reviewee?.email || ''}
                        </div>
                      </td>
                      <td>
                        <Stars rating={review.rating} />
                      </td>
                      <td>
                        <div
                          className="text-truncate text-muted small"
                          style={{ maxWidth: '250px' }}
                          title={review.comment}
                        >
                          {review.comment || '—'}
                        </div>
                      </td>
                      <td className="small text-muted">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                          onClick={() => handleDeleteClick(review._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              label="reviews"
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AdminModal
        title="Delete Review"
        isOpen={!!reviewToDelete}
        onClose={() => !deleting && setReviewToDelete(null)}
        maxWidth="400px"
        footer={
          <>
            <Button
              type="button"
              className="btn btn-light px-4 rounded-3 border"
              onClick={() => setReviewToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn btn-danger px-4 rounded-3 fw-bold"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Review'}
            </Button>
          </>
        }
      >
        <div className="text-center py-2">
          <div className="text-danger mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
            </svg>
          </div>
          <h5 className="fw-bold">Delete this review?</h5>
          <p className="text-muted mb-0 small">
            This action is permanent and will remove the review from both user profiles.
          </p>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
