import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "./components/AdminLayout";
import { adminApi } from "../../api/admin";
import type { IAdminJob, AdminJobFilters } from "../../types/admin";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastId = 0;

export function AdminJobsPage() {
  const [jobs, setJobs] = useState<IAdminJob[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminJobFilters>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
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
        err instanceof Error ? err.message : "Failed to load jobs",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this job and all its proposals?")) return;
    try {
      await adminApi.deleteJob(id);
      showToast("Job deleted successfully", "success");
      fetchJobs();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete job",
        "error",
      );
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatBudget = (job: IAdminJob) => {
    const amt = job.budget?.toLocaleString() ?? "—";
    return `$${amt} (${job.budgetType || "fixed"})`;
  };

  return (
    <AdminLayout title="Job Management">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="admin-toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`admin-toast ${t.type}`}>
              {t.type === "success" ? "✅" : "❌"} {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Jobs ({total})</h2>
          <div className="admin-table-filters">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search || ""}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, search: e.target.value || undefined });
              }}
            />
            <select
              value={filters.status || ""}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  ...filters,
                  status: (e.target.value ||
                    undefined) as AdminJobFilters["status"],
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
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Loading jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">💼</div>
            <p>No jobs found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
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
                        <small style={{ color: "#94a3b8" }}>
                          {job.skillsRequired?.slice(0, 3).join(", ")}
                          {job.skillsRequired?.length > 3 && "..."}
                        </small>
                      </td>
                      <td>{job.client?.username || "—"}</td>
                      <td>{formatBudget(job)}</td>
                      <td>
                        <span className={`admin-badge ${job.status}`}>
                          {job.status?.replace("_", " ")}
                        </span>
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

            <div className="admin-pagination">
              <span className="pagination-info">
                Page {page} of {totalPages} · {total} jobs
              </span>
              <div className="pagination-buttons">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
