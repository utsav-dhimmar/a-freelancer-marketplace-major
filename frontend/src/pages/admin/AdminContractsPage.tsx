import { useEffect, useState, useCallback } from 'react';
import {
  AdminLayout,
  AdminBadge,
  AdminPagination,
  AdminToast,
  AdminLoading,
  AdminEmpty,
} from './components';
import type { Toast } from './components';
import { adminApi } from '../../api/admin';
import type { IAdminContract, AdminContractFilters } from '../../types/admin';

const CONTRACT_STATUSES = [
  'active',
  'submitted',
  'completed',
  'disputed',
] as const;

let toastId = 0;

const TABLE_HEADINGS = [
  'Job',
  'Client',
  'Freelancer',
  'Amont',
  'Status',
  'Started',
  'Actions',
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

  const showToast = (message: string, type: 'success' | 'error') => {
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
        err instanceof Error ? err.message : 'Failed to load contracts',
        'error',
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
      showToast('Contract status updated successfully', 'success');
      fetchContracts();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update contract status',
        'error',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <AdminLayout title="Contract Management">
      <AdminToast toasts={toasts} />

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Contracts ({total})</h2>
          <div className="admin-table-filters">
            <select
              value={filters.status || ''}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  status: (e.target.value ||
                    undefined) as AdminContractFilters['status'],
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
          <AdminLoading message="Loading contracts..." />
        ) : contracts.length === 0 ? (
          <AdminEmpty icon="📄" message="No contracts found" />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
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
                        <strong>{c.job?.title || '—'}</strong>
                      </td>
                      <td>{c.client?.username || '—'}</td>
                      <td>{c.freelancer?.username || '—'}</td>
                      <td>${c.amount?.toLocaleString() || '0'}</td>
                      <td>
                        <AdminBadge variant={c.status}>{c.status}</AdminBadge>
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
                            fontSize: '0.8rem',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer',
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

            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              label="contracts"
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
