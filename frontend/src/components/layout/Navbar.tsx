import { useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  {
    lable: 'Find Jobs',
    link: '/jobs',
  },
  {
    lable: 'Freelancers',
    link: '/freelancers',
  },
];
const AUTH_LINK = [
  {
    lable: 'Login',
    link: '/login',
  },
  {
    lable: 'Register',
    link: '/register',
  },
];
const NAV_AUTHNICATED_LINK = [
  {
    lable: 'Dashboard',

    link: '/dashboard',
  },
  {
    lable: 'Proposals',
    link: '/dashboard/proposals',
  },
  {
    lable: 'Contracts',
    link: '/dashboard/contracts',
  },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCollapse = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleCollapse();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-decoration-none">
          <span className="text-dark">Freelance</span>
          <span className="text-primary">Hub</span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <div className="navbar-nav me-auto">
            {NAV_LINKS.map(({ lable, link }) => (
              <Link
                to={link}
                className="nav-link px-3 fw-medium text-dark"
                onClick={handleCollapse}
              >
                {lable}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                {NAV_AUTHNICATED_LINK.map(({ lable, link }) => (
                  <Link
                    to={link}
                    className="nav-link px-3 fw-medium text-dark"
                    onClick={handleCollapse}
                  >
                    {lable}
                  </Link>
                ))}

                {user?.role === 'freelancer' && (
                  <Link
                    to="/freelancers/me"
                    className="nav-link px-3 fw-medium text-dark"
                    onClick={handleCollapse}
                  >
                    Freelancer Profile
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="nav-link px-3 fw-medium text-dark"
                  onClick={handleCollapse}
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="navbar-nav ms-auto align-items-lg-center gap-2 pt-2 pt-lg-0 border-top border-lg-0">
            {isAuthenticated ? (
              <>
                <div className="nav-item d-none d-lg-block me-2">
                  <span className="small text-muted fw-medium">
                    Hi, {user?.fullname?.split(' ')[0] || user?.username}
                  </span>
                </div>
                {user?.role === 'client' && (
                  <Link
                    to="/jobs/create"
                    className="btn btn-primary btn-sm px-3 fw-bold text-uppercase"
                    onClick={handleCollapse}
                  >
                    Post Job
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm px-3 fw-bold text-uppercase d-flex align-items-center gap-2"
                  onClick={handleLogout}
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                {AUTH_LINK.map(({ lable, link }) => (
                  <Link
                    to={link}
                    key={lable}
                    className={
                      link == '/login'
                        ? 'btn btn-link text-decoration-none text-dark fw-medium px-3'
                        : 'btn btn-primary btn-sm px-4 fw-bold text-uppercase rounded-pill'
                    }
                    onClick={handleCollapse}
                  >
                    {lable}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
