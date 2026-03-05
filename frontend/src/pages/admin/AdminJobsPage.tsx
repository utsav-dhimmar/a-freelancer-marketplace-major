import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminJobFilters, IAdminJob } from '../../types/admin';
import type { Toast } from './components';
import {
  AdminBadge,
  AdminEmpty,
  AdminLayout,
  AdminLoading,
  AdminPagination,
  AdminToast,
} from './components';

let toastId = 0;

export function AdminJobsPage() {
  const [jobs, setJobs] = useState<IAdminJob[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminJobFilters>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters: AdminJobFilters = {};
      if (filters.status) cleanFilters.status = filters.status;
      if (filters.search) cleanFilters.search = filters.search;

      const data = await adminApi.getJobs(page, 10, cleanFilters);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load jobs',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job and all its proposals?')) return;
    try {
      await adminApi.deleteJob(id);
      showToast('Job deleted successfully', 'success');
      fetchJobs();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete job',
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

  const formatBudget = (job: IAdminJob) => {
    const amt = job.budget?.toLocaleString() ?? '—';

    return `INR ${amt} (${job.budgetType || 'fixed'})`;
  };

  return (
    <AdminLayout title="Job Management">
      <AdminToast toasts={toasts} />

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Jobs ({total})</h2>
          <div className="admin-table-filters">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search || ''}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  ...filters,
                  search: e.target.value || undefined,
                });
              }}
            />
            <select
              value={filters.status || ''}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  ...filters,
                  status: (e.target.value ||
                    undefined) as AdminJobFilters['status'],
                });
              }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <AdminLoading message="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <AdminEmpty icon="💼" message="No jobs found" />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Client</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <strong>{job.title}</strong>
                        <br />
                        <small style={{ color: '#94a3b8' }}>
                          {job.skillsRequired?.slice(0, 3).join(', ')}
                          {job.skillsRequired?.length > 3 && '...'}
                        </small>
                      </td>
                      <td>{job.client?.username || '—'}</td>
                      <td>{formatBudget(job)}</td>
                      <td>
                        <AdminBadge variant={job.status}>
                          {job.status?.replace('_', ' ')}
                        </AdminBadge>
                      </td>
                      <td>{formatDate(job.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn delete"
                          onClick={() => handleDelete(job._id)}
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
              label="jobs"
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
