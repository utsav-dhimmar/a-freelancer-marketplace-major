import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { AdminJobFilters, IAdminJob } from "../../types/admin";
import type { Toast } from "./components";
import {
  AdminBadge,
  AdminEmpty,
  AdminLayout,
  AdminLoading,
  AdminPagination,
  AdminToast,
} from "./components";
import { Input, Select } from "../../components/ui";

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

    return `INR ${amt} (${job.budgetType || "fixed"})`;
  };

  return (
    <AdminLayout title="Job Management">
      <AdminToast toasts={toasts} />

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <h5 className="mb-0 fw-bold text-dark">All Jobs ({total})</h5>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <div style={{ maxWidth: "250px" }}>
                <Input
                  className="bg-light"
                  placeholder="Search jobs..."
                  value={filters.search || ""}
                  onChange={(e) => {
                    setPage(1);
                    setFilters({
                      ...filters,
                      search: e.target.value || undefined,
                    });
                  }}
                />
              </div>
              <Select
                className="bg-light"
                style={{ width: "auto" }}
                value={filters.status || ""}
                onChange={(e) => {
                  setPage(1);
                  setFilters({
                    ...filters,
                    status: (e.target.value ||
                      undefined) as AdminJobFilters["status"],
                  });
                }}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "open", label: "Open" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <AdminLoading message="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div className="p-4">
            <AdminEmpty message="No jobs found" />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-uppercase small fw-bold text-muted px-4 py-3">
                      Title
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Client
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Budget
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Status
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Deadline
                    </th>
                    <th className="text-uppercase small fw-bold text-muted py-3">
                      Created
                    </th>
                    <th className="text-uppercase small fw-bold text-muted px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">{job.title}</div>
                        <div className="small text-muted">
                          {job.skillsRequired?.slice(0, 3).join(", ")}
                          {job.skillsRequired?.length > 3 && "..."}
                        </div>
                      </td>
                      <td>{job.client?.username || "—"}</td>
                      <td className="fw-medium text-dark">
                        {formatBudget(job)}
                      </td>
                      <td>
                        <AdminBadge variant={job.status}>
                          {job.status?.replace("_", " ")}
                        </AdminBadge>
                      </td>
                      <td>{job.deadline ? formatDate(job.deadline) : "—"}</td>
                      <td>{formatDate(job.createdAt)}</td>
                      <td className="px-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                          onClick={() => handleDelete(job._id)}
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
              label="jobs"
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
