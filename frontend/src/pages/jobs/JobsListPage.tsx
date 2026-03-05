import type { SyntheticEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api';
import { Button, Badge, Spinner, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import type { IJob, JobStatus } from '../../types';

const statusBadgeVariants: Record<
  string,
  'primary' | 'secondary' | 'success' | 'danger'
> = {
  open: 'primary',
  in_progress: 'secondary',
  completed: 'success',
  cancelled: 'danger',
};

export function JobsListPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JobStatus | ''>('');

  useEffect(() => {
    void loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setJobs([]);
    try {
      const params: { search?: string; status?: string } = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const data = await jobApi.getAll(params);
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadJobs();
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="mb-1">Browse Jobs</h1>
        <p className="text-muted mb-0">
          Discover your next opportunity across hundreds of open positions.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label small text-uppercase text-muted">
                Search
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search jobs by title, skill, or keyword..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small text-uppercase text-muted">
                Status
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as JobStatus | '')
                }
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-12 col-md-2 d-grid">
              <Button type="submit" className="text-uppercase">
                Search
              </Button>
            </div>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-5">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {jobs.length === 0 ? (
            <div className="col-12">
              <EmptyState
                title="No jobs found"
                description="Try adjusting your search criteria or browse all available jobs."
              />
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="col">
                <Link
                  to={`/jobs/${job._id}`}
                  className="card h-100 text-decoration-none text-reset shadow-sm border-0"
                >
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                      <h3 className="h5 mb-0">{job.title}</h3>
                      <Badge
                        variant={statusBadgeVariants[job.status] || 'secondary'}
                        className="text-uppercase"
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-3">{job.description}</p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {job.skillsRequired.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          pill
                          variant="light"
                          className="text-dark border border-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <Badge
                          pill
                          variant="light"
                          className="text-muted border"
                        >
                          +{job.skillsRequired.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-auto gap-3">
                      <div>
                        <p className="mb-0 fw-semibold text-primary">
                          {formatCurrency(job.budget)}
                          <span className="small text-muted">
                            {job.budgetType === 'hourly' ? ' /hr' : ' fixed'}
                          </span>
                        </p>
                      </div>
                      <Button variant="outline-secondary" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
