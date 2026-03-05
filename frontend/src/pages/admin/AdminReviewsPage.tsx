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
    <span className="admin-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? '' : 'empty'}>
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

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Reviews ({total})</h2>
        </div>

        {loading ? (
          <AdminLoading message="Loading reviews..." />
        ) : reviews.length === 0 ? (
          <AdminEmpty icon="⭐" message="No reviews found" />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Reviewee</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <strong>{review.reviewer?.username || '—'}</strong>
                        <br />
                        <small style={{ color: '#94a3b8' }}>
                          {review.reviewer?.email || ''}
                        </small>
                      </td>
                      <td>
                        <strong>{review.reviewee?.username || '—'}</strong>
                        <br />
                        <small style={{ color: '#94a3b8' }}>
                          {review.reviewee?.email || ''}
                        </small>
                      </td>
                      <td>
                        <Stars rating={review.rating} />
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: '250px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={review.comment}
                        >
                          {review.comment || '—'}
                        </div>
                      </td>
                      <td>{formatDate(review.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn delete"
                          onClick={() => handleDelete(review._id)}
                        >
                          🗑️ Delete
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
