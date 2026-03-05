import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { formatCurrency } from '../../constants/currency';
import type { AdminContractFilters, IAdminContract } from '../../types/admin';
import type { Toast } from './components';
import {
  AdminBadge,
  AdminEmpty,
  AdminLayout,
  AdminLoading,
  AdminPagination,
  AdminToast,
} from './components';

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
  'Amount',
  'Status',
  'Started',
  'Update Status',
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

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark">All Contracts ({total})</h5>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-medium d-none d-sm-inline">Filter:</span>
            <select
              className="form-select form-select-sm bg-light"
              style={{ width: 'auto' }}
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
          <div className="p-4">
            <AdminEmpty message="No contracts found" />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    {TABLE_HEADINGS.map((heading) => (
                      <th key={heading} className="text-uppercase small fw-bold text-muted px-4 py-3">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c._id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">{c.job?.title || '—'}</div>
                      </td>
                      <td>{c.client?.username || '—'}</td>
                      <td>{c.freelancer?.username || '—'}</td>
                      <td className="fw-medium text-dark">
                        {formatCurrency(
                          c.amount as unknown as number,
                        ) || '0'}
                      </td>
                      <td>
                        <AdminBadge variant={c.status}>{c.status}</AdminBadge>
                      </td>
                      <td>{formatDate(c.startDate || c.createdAt)}</td>
                      <td className="px-4">
                        <select
                          className="form-select form-select-sm rounded-pill"
                          value={c.status}
                          disabled={updatingId === c._id}
                          onChange={(e) =>
                            handleStatusChange(
                              c._id,
                              e.target
                                .value as (typeof CONTRACT_STATUSES)[number],
                            )
                          }
                          style={{ cursor: 'pointer', maxWidth: '140px' }}
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
