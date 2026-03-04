import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { IJob } from '../../types';

export function MyJobsPage() {
  const {} = useAuth();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await jobApi.myJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Jobs</h2>
        <Link to="/jobs/create">
          <Button variant="primary">Post a New Job</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <div className="text-center py-5">
            <h4 className="text-muted mb-3">You haven't posted any jobs yet</h4>
            <Link to="/jobs/create">
              <Button>Post Your First Job</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="row g-4">
          {jobs.map((job) => (
            <div key={job._id} className="col-md-6 mb-4">
              <Card className="h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h4
                    className="card-title h5 mb-0 text-truncate"
                    style={{ maxWidth: '70%' }}
                  >
                    {job.title}
                  </h4>
                  <span
                    className={`badge bg-${getStatusBadgeVariant(job.status)}`}
                  >
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p
                  className="card-text text-muted small flex-grow-1"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {job.description}
                </p>

                <div className="mt-3 pt-3 border-top">
                  <div className="row text-center mb-3 g-2">
                    <div className="col-6 border-end">
                      <div className="text-muted small text-uppercase">
                        Budget
                      </div>
                      <div className="fw-semibold">${job.budget}</div>
                      <div
                        className="text-muted"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {job.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted small text-uppercase">
                        Deadline
                      </div>
                      <div className="fw-semibold">
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Link to={`/jobs/${job._id}`} className="flex-grow-1">
                      <Button variant="outline-primary" className="w-100">
                        View Details
                      </Button>
                    </Link>
                    <Link
                      to={`/dashboard/jobs/${job._id}/proposals`}
                      className="flex-grow-1"
                    >
                      <Button variant="primary" className="w-100">
                        View Proposals
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
