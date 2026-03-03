import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import '../admin.css';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-wrapper">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-content">
        <header className="admin-topbar">
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <button
              type="button"
              className="d-lg-none"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                padding: 0,
              }}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h1>{title}</h1>
          </div>
          <div className="admin-user-badge">
            <div className="badge-avatar">A</div>
            <span>{user?.email || 'Admin'}</span>
          </div>
        </header>

        <div className="admin-page-body">{children}</div>
      </div>
    </div>
  );
}
