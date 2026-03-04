import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

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
    section: "Main",
    links: [{ to: "/admin", label: "Dashboard", end: true }],
  },
  {
    section: "Management",
    links: [
      { to: "/admin/users", label: "Users" },
      { to: "/admin/jobs", label: "Jobs" },
      { to: "/admin/contracts", label: "Contracts" },
      { to: "/admin/reviews", label: "Reviews" },
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
    navigate("/admin/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-overlay position-fixed inset-0 bg-dark bg-opacity-50"
          onClick={onClose}
          style={{
            zIndex: 1035,
            display: "block", // Added display: block when isOpen is true
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      <aside
        className={`admin-sidebar bg-dark text-light ${isOpen ? "open" : ""}`}
      >
        <div className="admin-sidebar-brand border-bottom border-secondary border-opacity-25 px-4 py-3">
          <div className="d-flex align-items-center gap-3">
            <div>
              <h5 className="mb-0 fw-bold">FreelanceHub</h5>
              <span className="small text-muted">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav py-3 flex-grow-1 overflow-auto">
          {NAV_ITEMS.map((section) => (
            <div className="mb-4 px-3" key={section.section}>
              <p
                className="small text-muted text-uppercase fw-bold mb-2 ps-2"
                style={{ letterSpacing: "1px", fontSize: "0.7rem" }}
              >
                {section.section}
              </p>
              <ul className="list-unstyled mb-0">
                {section.links.map((link) => (
                  <li key={link.to} className="mb-1">
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-light opacity-75"
                        }`
                      }
                      onClick={onClose}
                    >
                      <span className="fw-medium">{link.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer border-top border-secondary border-opacity-25 p-3">
          <button
            type="button"
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={handleLogout}
          >
            <span className="fw-bold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
