import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface NavLinkItem {
  to: string;
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
    links: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    section: 'Management',
    links: [
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/jobs', label: 'Jobs' },
      { to: '/admin/contracts', label: 'Contracts' },
      { to: '/admin/reviews', label: 'Reviews' },
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          onClick={onClose}
          style={{ zIndex: 1045 }}
        />
      )}

      <aside
        className={`bg-dark text-white d-flex flex-column h-100 border-end border-secondary border-opacity-25 transition-all h-100 ${
          isOpen ? 'show-sidebar' : 'hide-sidebar'
        }`}
        style={{
          width: '260px',
          minWidth: '260px',
          zIndex: 1050,
        }}
      >
        <div className="border-bottom border-secondary border-opacity-25 px-4 py-4 mb-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-primary bg-gradient rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '40px', height: '40px' }}
            >
              <span className="fw-bold">FH</span>
            </div>
            <div>
              <h6 className="mb-0 fw-bold tracking-tight">FreelanceHub</h6>
              <span className="small text-secondary fw-medium">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        <nav className="py-3 flex-grow-1 overflow-auto">
          {NAV_ITEMS.map((section) => (
            <div className="mb-4 px-3" key={section.section}>
              <p
                className="small text-secondary text-uppercase fw-bold mb-2 ps-3"
                style={{
                  letterSpacing: '1.2px',
                  fontSize: '0.65rem',
                }}
              >
                {section.section}
              </p>
              <ul className="nav flex-column gap-1">
                {section.links.map((link) => (
                  <li key={link.to} className="nav-item">
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 mx-2 transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-sm fw-semibold'
                            : 'text-secondary hover-bg-secondary'
                        }`
                      }
                      onClick={onClose}
                    >
                      <span>{link.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-top border-secondary border-opacity-25 p-4 mt-auto">
          <button
            type="button"
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 border-opacity-25"
            onClick={handleLogout}
          >
            <span className="fw-bold small text-uppercase tracking-wider">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
