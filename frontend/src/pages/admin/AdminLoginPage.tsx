import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminApi.login(email, password);
      setUser(data.user);
      navigate('/admin');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-dark"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%)',
      }}
    >
      <div
        className="card shadow-lg border-0 rounded-4 overflow-hidden"
        style={{ maxWidth: '420px', width: '90%' }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-5">
            <div
              className="bg-primary bg-gradient text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-4 shadow-sm"
              style={{
                width: '64px',
                height: '64px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              FH
            </div>
            <h2 className="fw-bold text-dark">Admin Portal</h2>
            <p className="text-muted small">
              Enter your credentials to access the management dashboard
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger border-0 rounded-3 py-2 px-3 small mb-4 d-flex align-items-center gap-2"
              role="alert"
            >
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="admin-email"
                className="form-label small fw-bold text-muted text-uppercase tracking-wider"
                style={{ fontSize: '0.7rem' }}
              >
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  📧
                </span>
                <input
                  id="admin-email"
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="admin-password"
                className="form-label small fw-bold text-muted text-uppercase tracking-wider"
                style={{ fontSize: '0.7rem' }}
              >
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  🔒
                </span>
                <input
                  id="admin-password"
                  type="password"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
        <div className="card-footer bg-light border-0 py-3 text-center">
          <span className="text-muted small">
            FreelanceHub Marketplace Admin
          </span>
        </div>
      </div>
    </div>
  );
}
