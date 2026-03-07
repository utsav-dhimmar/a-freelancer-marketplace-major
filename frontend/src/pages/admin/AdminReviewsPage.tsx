import { useEffect, useState, useCallback } from 'react';
import {
  AdminLayout,
  AdminPagination,
  AdminToast,
  AdminLoading,
  AdminEmpty,
} from './components';
import type { Toast } from './components';
import { adminApi } from '../../api/admin';
import type { IAdminReview } from '../../types/admin';

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminApi.deleteReview(id);
      showToast('Review deleted successfully', 'success');
      fetchReviews();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete review',
        'error',
      );
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
                          onClick={() => handleDelete(review._id)}
                        >
                          <span>🗑️</span> Delete
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
    </AdminLayout>
  );
}
