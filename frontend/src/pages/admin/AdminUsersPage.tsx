import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "./components/AdminLayout";
import { adminApi } from "../../api/admin";
import type { IUser } from "../../types";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastId = 0;

const TABLE_HEADINGS = ["User", "Email", "Role", "Joined", "Actions"];

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
    username: "",
    fullname: "",
    email: "",
    role: "",
  });
  const [saving, setSaving] = useState(false);

  // View detail modal
  const [viewUser, setViewUser] = useState<IUser | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
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
        err instanceof Error ? err.message : "Failed to load users",
        "error",
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
        err instanceof Error ? err.message : "Failed to load user details",
        "error",
      );
    } finally {
      setViewLoading(false);
    }
  };

  const openEdit = (user: IUser) => {
    setEditUser(user);
    setEditForm({
      username: user.username || "",
      fullname:
        (user as unknown as { fullname?: string }).fullname || user.name || "",
      email: user.email || "",
      role: user.role || "",
    });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editUser._id!, editForm);
      setEditUser(null);
      showToast("User updated successfully", "success");
      fetchUsers();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update user",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminApi.deleteUser(id);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete user",
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

  return (
    <AdminLayout title="User Management">
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
          <h2>All Users ({total})</h2>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👥</div>
            <p>No users found</p>
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
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <strong>{user.username}</strong>
                        <br />
                        <small style={{ color: "#94a3b8" }}>
                          {(user as unknown as { fullname?: string })
                            .fullname ||
                            user.name ||
                            "—"}
                        </small>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <button
                            type="button"
                            className="admin-action-btn view"
                            onClick={() => handleView(user._id!)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn edit"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn delete"
                            onClick={() => handleDelete(user._id!)}
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

            <div className="admin-pagination">
              <span className="pagination-info">
                Page {page} of {totalPages} · {total} users
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

      {/* ─── View User Detail Modal ─────────────────────────────── */}
      {(viewUser || viewLoading) && (
        <div
          className="admin-modal-overlay"
          onClick={() => !viewLoading && setViewUser(null)}
        >
          <div
            className="admin-modal admin-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>User Details</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setViewUser(null)}
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              {viewLoading ? (
                <div className="admin-loading" style={{ padding: "2rem 0" }}>
                  <div className="admin-spinner" />
                  <span>Loading user details...</span>
                </div>
              ) : (
                viewUser && (
                  <>
                    <div className="admin-detail-avatar">
                      {(viewUser.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-detail-grid">
                      <div className="admin-detail-item">
                        <div className="detail-label">Username</div>
                        <div className="detail-value">
                          {viewUser.username || "—"}
                        </div>
                      </div>
                      <div className="admin-detail-item">
                        <div className="detail-label">Full Name</div>
                        <div className="detail-value">
                          {(viewUser as unknown as { fullname?: string })
                            .fullname ||
                            viewUser.name ||
                            "—"}
                        </div>
                      </div>
                      <div className="admin-detail-item">
                        <div className="detail-label">Email</div>
                        <div className="detail-value">
                          {viewUser.email || "—"}
                        </div>
                      </div>
                      <div className="admin-detail-item">
                        <div className="detail-label">Role</div>
                        <div className="detail-value">
                          <span className={`admin-badge ${viewUser.role}`}>
                            {viewUser.role}
                          </span>
                        </div>
                      </div>
                      <div className="admin-detail-item">
                        <div className="detail-label">Joined</div>
                        <div className="detail-value">
                          {formatDate(viewUser.createdAt)}
                        </div>
                      </div>
                      <div className="admin-detail-item">
                        <div className="detail-label">User ID</div>
                        <div
                          className="detail-value"
                          style={{ fontSize: "0.75rem", color: "#64748b" }}
                        >
                          {viewUser._id}
                        </div>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setViewUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ────────────────────────────────────────────── */}
      {editUser && (
        <div className="admin-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit User</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setEditUser(null)}
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>Username</label>
                <input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={editForm.fullname}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullname: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-save"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
