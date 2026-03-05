import { Link } from 'react-router-dom';

const footerColumns = [
  {
    title: 'Platform',
    items: [
      { label: 'Browse Jobs', to: '/jobs' },
      { label: 'Find Talent', to: '/freelancers' },
      { label: 'Post a Project', to: '/jobs/create' },
    ],
  },

  {
    title: 'Support',
    items: [
      { label: 'Help Center', to: '/help' },
      { label: 'Contact', to: '/contact' },
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-light border-top mt-auto">
      <div className="container py-5">
        <div className="row gy-4">
          <div className="col-md-4">
            <Link
              to="/"
              className="navbar-brand fw-bold d-inline-flex align-items-baseline gap-1 text-decoration-none"
            >
              <span className="text-dark">Freelance</span>
              <span className="text-primary">Hub</span>
            </Link>
            <p className="text-muted mt-3">
              Where exceptional talent meets extraordinary opportunities.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div className="col-6 col-md-2" key={column.title}>
              <h6 className="text-uppercase small text-muted">
                {column.title}
              </h6>
              <ul className="list-unstyled">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      className="text-decoration-none text-muted"
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mt-4 pt-4 border-top">
          <small className="text-muted">
            &copy; 2026 FreelanceHub. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}
