import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-hidden">
        <header
          className="navbar bg-white border-bottom px-4 sticky-top shadow-sm"
          style={{ height: '64px', zIndex: 1020 }}
        >
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-link p-0 d-lg-none text-dark"
                onClick={() => setSidebarOpen(true)}
              >
                <span style={{ fontSize: '1.5rem' }}>☰</span>
              </button>
              <h5 className="fw-bold mb-0 text-dark tracking-tight">{title}</h5>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="d-flex flex-column align-items-end d-none d-sm-flex">
                <span className="small fw-bold text-dark">
                  {user?.name || 'Admin'}
                </span>
                <span
                  className="small text-muted"
                  style={{ fontSize: '0.7rem' }}
                >
                  {user?.email}
                </span>
              </div>
              <div
                className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '0.9rem',
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="container-fluid py-4 px-lg-5">{children}</main>
      </div>
    </div>
  );
}
