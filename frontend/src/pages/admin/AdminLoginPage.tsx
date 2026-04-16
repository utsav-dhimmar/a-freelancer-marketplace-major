import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button } from '../../components/ui';

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
            <Input
              id="admin-email"
              type="email"
              label="Email Address"
              className="bg-light"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              id="admin-password"
              type="password"
              label="Password"
              className="bg-light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-100 py-3 rounded-3 fw-bold shadow-sm"
              isLoading={loading}
              disabled={!email || !password}
            >
              Sign In to Dashboard
            </Button>
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
