import { Outlet } from 'react-router-dom';

/**
 * Root layout for all admin routes.
 * Renders NO navbar/footer — admin pages use their own AdminLayout with sidebar.
 */
export function AdminRootLayout() {
  return (
    <div className="admin-root">
      <Outlet />
    </div>
  );
}
