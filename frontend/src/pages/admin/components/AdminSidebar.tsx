import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface NavLinkItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
}

interface NavSection {
  section: string;
  links: NavLinkItem[];
}

const NAV_ITEMS: NavSection[] = [
  {
    section: 'Main',
    links: [{ to: '/admin', icon: '📊', label: 'Dashboard', end: true }],
  },
  {
    section: 'Management',
    links: [
      { to: '/admin/users', icon: '👥', label: 'Users' },
      { to: '/admin/jobs', icon: '💼', label: 'Jobs' },
      { to: '/admin/contracts', icon: '📄', label: 'Contracts' },
      { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1035,
            display: 'none',
          }}
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="brand-icon">FH</div>
          <div>
            <h5>FreelanceHub</h5>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div className="admin-nav-section" key={section.section}>
              <p className="admin-nav-section-title">{section.section}</p>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
