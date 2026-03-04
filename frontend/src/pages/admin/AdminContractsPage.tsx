import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "./components/AdminLayout";
import { adminApi } from "../../api/admin";
import type { IAdminContract, AdminContractFilters } from "../../types/admin";

const CONTRACT_STATUSES = [
  "active",
  "submitted",
  "completed",
  "disputed",
] as const;

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastId = 0;

const TABLE_HEADINGS = [
  "Job",
  "Client",
  "Freelancer",
  "Amont",
  "Status",
  "Started",
  "Actions",
];

export function AdminContractsPage() {
  const [contracts, setContracts] = useState<IAdminContract[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminContractFilters>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters: AdminContractFilters = {};
      if (filters.status) cleanFilters.status = filters.status;

      const data = await adminApi.getContracts(page, 10, cleanFilters);
      setContracts(data.contracts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load contracts",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleStatusChange = async (
    id: string,
    newStatus: (typeof CONTRACT_STATUSES)[number],
  ) => {
    setUpdatingId(id);
    try {
      await adminApi.updateContractStatus(id, newStatus);
      showToast("Contract status updated successfully", "success");
      fetchContracts();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update contract status",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <AdminLayout title="Contract Management">
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
          <h2>All Contracts ({total})</h2>
          <div className="admin-table-filters">
            <select
              value={filters.status || ""}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  status: (e.target.value ||
                    undefined) as AdminContractFilters["status"],
                });
              }}
            >
              <option value="">All Statuses</option>
              {CONTRACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Loading contracts...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📄</div>
            <p>No contracts found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {TABLE_HEADINGS.map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.job?.title || "—"}</strong>
                      </td>
                      <td>{c.client?.username || "—"}</td>
                      <td>{c.freelancer?.username || "—"}</td>
                      <td>${c.amount?.toLocaleString() || "0"}</td>
                      <td>
                        <span className={`admin-badge ${c.status}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{formatDate(c.startDate || c.createdAt)}</td>
                      <td>
                        <select
                          value={c.status}
                          disabled={updatingId === c._id}
                          onChange={(e) =>
                            handleStatusChange(
                              c._id,
                              e.target
                                .value as (typeof CONTRACT_STATUSES)[number],
                            )
                          }
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.3rem 0.5rem",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                          }}
                        >
                          {CONTRACT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="pagination-info">
                Page {page} of {totalPages} · {total} contracts
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
