import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import '../admin.css';
import { AdminSidebar } from './AdminSidebar';

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

      <div className="admin-content bg-light">
        <header className="admin-topbar navbar bg-white border-bottom px-4 sticky-top">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-link p-0 d-lg-none text-dark"
                onClick={() => setSidebarOpen(true)}
              >
                <span style={{ fontSize: '1.5rem' }}>☰</span>
              </button>
              <h1 className="h5 fw-bold mb-0 text-dark">{title}</h1>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '0.8rem',
                }}
              >
                A
              </div>
              <span className="small text-muted d-none d-sm-inline">
                {user?.email || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="admin-page-body container-fluid py-4 px-4">
          {children}
        </main>
      </div>
    </div>
  );
}
