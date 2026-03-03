import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminGuestRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps the admin login page.
 * - If admin is already logged in → redirect to /admin
 * - If a normal user is logged in → redirect to /dashboard
 * - If not logged in → show admin login page
 */
export function AdminGuestRoute({ children }: AdminGuestRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '50vh' }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
