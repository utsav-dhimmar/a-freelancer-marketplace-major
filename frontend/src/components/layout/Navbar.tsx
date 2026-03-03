import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
    if (dropdownOpen) {
      setDropdownOpen(false);
    }
  };

  const handleCollapse = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleCollapse();
  };

  const initial = (user?.fullname || user?.username)?.[0]?.toUpperCase() || 'U';
  const MENU_LINKS = [
    {
      label: 'Job',
      link: '/jobs',
    },
    {
      label: 'Freelancers',
      link: '/freelancers',
    },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-decoration-none">
          <span className="text-dark">Freelance</span>
          <span className="text-primary">Hub</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <div className="navbar-nav me-auto mb-3 mb-lg-0">
            {MENU_LINKS.map(({ link, label }) => (
              <Link
                to={link}
                className="nav-link text-uppercase small px-3 text-center text-lg-start"
                onClick={handleCollapse}
                key={label}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link text-uppercase small px-3 text-center text-lg-start d-none d-lg-block"
                  onClick={handleCollapse}
                >
                  Dashboard
                </Link>
                {user?.role === 'freelancer' && (
                  <Link
                    to="/dashboard/proposals"
                    className="nav-link text-uppercase small px-3 text-center text-lg-start d-none d-lg-block"
                    onClick={handleCollapse}
                  >
                    Proposals
                  </Link>
                )}
                <Link
                  to="/dashboard/contracts"
                  className="nav-link text-uppercase small px-3 text-center text-lg-start d-none d-lg-block"
                  onClick={handleCollapse}
                >
                  Contracts
                </Link>
              </>
            )}
          </div>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 gap-lg-3 w-100 w-lg-auto">
            {isAuthenticated ? (
              <>
                {user?.role === 'client' && (
                  <Link
                    to="/jobs/create"
                    className="btn btn-primary btn-sm text-uppercase"
                    onClick={handleCollapse}
                  >
                    Post Job
                  </Link>
                )}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    onClick={() => setDropdownOpen((current) => !current)}
                    aria-expanded={dropdownOpen}
                  >
                    <span
                      className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32 }}
                    >
                      {initial}
                    </span>
                    <span className="d-none d-lg-inline">
                      {(user?.fullname || user?.username)?.split(' ')[0] || 'Profile'}
                    </span>
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end ${
                      dropdownOpen ? 'show' : ''
                    }`}
                  >
                    <li>
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={handleCollapse}
                      >
                        Profile Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={handleCollapse}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard/proposals"
                        className="dropdown-item"
                        onClick={handleCollapse}
                      >
                        Proposals
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard/contracts"
                        className="dropdown-item"
                        onClick={handleCollapse}
                      >
                        Contracts
                      </Link>
                    </li>
                    {user?.role === 'freelancer' && (
                      <li>
                        <Link
                          to="/freelancers/me"
                          className="dropdown-item"
                          onClick={handleCollapse}
                        >
                          My Profile
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2 ms-lg-auto">
                <Link
                  to="/login"
                  className="btn btn-link btn-sm text-decoration-none text-dark px-3"
                  onClick={handleCollapse}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm text-uppercase"
                  onClick={handleCollapse}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
