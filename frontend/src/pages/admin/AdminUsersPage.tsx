import { useEffect, useState, useCallback } from 'react';
import {
  AdminLayout,
  AdminBadge,
  AdminPagination,
  AdminToast,
  AdminLoading,
  AdminEmpty,
  AdminModal,
} from './components';
import type { Toast } from './components';
import { adminApi } from '../../api/admin';
import type { IUser } from '../../types';

let toastId = 0;

const TABLE_HEADINGS = ['User', 'Email', 'Role', 'Joined', 'Actions'];

export function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Edit modal
  const [editUser, setEditUser] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    fullname: '',
    email: '',
    role: '',
  });
  const [saving, setSaving] = useState(false);

  // View detail modal
  const [viewUser, setViewUser] = useState<IUser | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Delete confirmation
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(page, 10);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load users',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleView = async (id: string) => {
    setViewLoading(true);
    try {
      const user = await adminApi.getUserById(id);
      setViewUser(user);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load user details',
        'error',
      );
    } finally {
      setViewLoading(false);
    }
  };

  const openEdit = (user: IUser) => {
    setEditUser(user);
    setEditForm({
      username: user.username || '',
      fullname:
        (user as unknown as { fullname?: string }).fullname || user.name || '',
      email: user.email || '',
      role: user.role || '',
    });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editUser._id!, editForm);
      setEditUser(null);
      showToast('User updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update user',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(userToDelete);
      showToast('User deleted successfully', 'success');
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete user',
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
    <AdminLayout title="User Management">
      <AdminToast toasts={toasts} />

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">All Users ({total})</h5>
        </div>

        {loading ? (
          <AdminLoading message="Loading users..." />
        ) : users.length === 0 ? (
          <div className="p-4">
            <AdminEmpty message="No users found" />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    {TABLE_HEADINGS.map((heading) => (
                      <th
                        key={heading}
                        className="text-uppercase small fw-bold text-muted px-4 py-3"
                        style={{ letterSpacing: '0.5px' }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">{user.username}</div>
                        <div className="small text-muted">
                          {(user as unknown as { fullname?: string })
                            .fullname ||
                            user.name ||
                            '—'}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <AdminBadge variant={user.role}>{user.role}</AdminBadge>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="px-4">
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => handleView(user._id!)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDeleteClick(user._id!)}
                          >
                            Delete
                          </button>
                        </div>
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
              label="users"
            />
          </>
        )}
      </div>

      <AdminModal
        title="User Details"
        isOpen={!!viewUser || viewLoading}
        onClose={() => !viewLoading && setViewUser(null)}
        loading={viewLoading}
        maxWidth="520px"
        footer={
          <button
            type="button"
            className="btn btn-secondary px-4 rounded-3"
            onClick={() => setViewUser(null)}
          >
            Close
          </button>
        }
      >
        {viewUser && (
          <>
            <div className="text-center mb-4">
              <div
                className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center fw-bold mx-auto mb-3 shadow-sm"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}
              >
                {(viewUser.username || 'U').charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold mb-0">{viewUser.username}</h5>
              <p className="text-muted small">
                {(viewUser as unknown as { fullname?: string }).fullname ||
                  viewUser.name ||
                  '—'}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div
                    className="text-uppercase small fw-bold text-muted mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                  >
                    Username
                  </div>
                  <div className="fw-semibold text-dark">
                    {viewUser.username || '—'}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div
                    className="text-uppercase small fw-bold text-muted mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                  >
                    Full Name
                  </div>
                  <div className="fw-semibold text-dark">
                    {(viewUser as unknown as { fullname?: string }).fullname ||
                      viewUser.name ||
                      '—'}
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border">
                  <div
                    className="text-uppercase small fw-bold text-muted mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                  >
                    Email Address
                  </div>
                  <div className="fw-semibold text-dark">
                    {viewUser.email || '—'}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div
                    className="text-uppercase small fw-bold text-muted mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                  >
                    Account Role
                  </div>
                  <div>
                    <AdminBadge variant={viewUser.role}>
                      {viewUser.role}
                    </AdminBadge>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div
                    className="text-uppercase small fw-bold text-muted mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                  >
                    Joined Date
                  </div>
                  <div className="fw-semibold text-dark">
                    {formatDate(viewUser.createdAt)}
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border">
                  <div
                    className="text-uppercase small fw-bold text-muted mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                  >
                    Internal User ID
                  </div>
                  <div
                    className="text-muted small font-monospace"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {viewUser._id}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminModal>

      <AdminModal
        title="Edit User Account"
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-light px-4 rounded-3 border"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary px-4 rounded-3 fw-bold"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted text-uppercase">
            Username
          </label>
          <input
            className="form-control rounded-3"
            value={editForm.username}
            onChange={(e) =>
              setEditForm({ ...editForm, username: e.target.value })
            }

          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted text-uppercase">
            Full Name
          </label>
          <input
            className="form-control rounded-3"
            value={editForm.fullname}
            onChange={(e) =>
              setEditForm({ ...editForm, fullname: e.target.value })
            }

          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted text-uppercase">
            Email Address
          </label>
          <input
            type="email"
            className="form-control rounded-3"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted text-uppercase">
            Account Role
          </label>
          <select
            className="form-select rounded-3"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>

          </select>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        title="Confirm Delete"
        isOpen={!!userToDelete}
        onClose={() => !deleting && setUserToDelete(null)}
        maxWidth="400px"
        footer={
          <>
            <button
              type="button"
              className="btn btn-light px-4 rounded-3 border"
              onClick={() => setUserToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger px-4 rounded-3 fw-bold"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </>
        }
      >
        <div className="text-center py-2">
          <div className="text-danger mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
              <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
            </svg>
          </div>
          <h5 className="fw-bold">Are you sure?</h5>
          <p className="text-muted mb-0">
            This action cannot be undone. All data associated with this user will be permanently removed.
          </p>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
