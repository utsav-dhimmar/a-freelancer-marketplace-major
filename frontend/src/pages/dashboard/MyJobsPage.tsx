import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api';
import { Button, Card, Badge, Spinner, EmptyState, Modal } from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import { useAuth } from '../../contexts/AuthContext';
import type { IJob } from '../../types';

export function MyJobsPage() {
  const {} = useAuth();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel confirmation state
  const [jobToCancel, setJobToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelJob = (id: string) => {
    setJobToCancel(id);
  };

  const confirmCancel = async () => {
    if (!jobToCancel) return;
    setCancelling(true);
    try {
      await jobApi.updateStatus(jobToCancel, 'cancelled');
      setJobToCancel(null);
      loadJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    } finally {
      setCancelling(false);
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
        <Spinner />
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
        <EmptyState
          title="You haven't posted any jobs yet"
          description="Post your first job to start finding freelancers."
        >
          <Link to="/jobs/create">
            <Button>Post Your First Job</Button>
          </Link>
        </EmptyState>
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
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </Badge>
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
                      <div className="fw-semibold">
                        {formatCurrency(job.budget)}
                      </div>
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
                    {job.status === 'open' && (
                      <Button
                        variant="outline-danger"
                        className="w-100"
                        onClick={() => handleCancelJob(job._id)}
                      >
                        Cancel Job
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!jobToCancel}
        title="Cancel Job"
        variant="confirm"
        confirmText="Yes, Cancel Job"
        onClose={() => !cancelling && setJobToCancel(null)}
        onConfirm={confirmCancel}
        isLoading={cancelling}
      >
        <p>Are you sure you want to cancel this job?</p>
        <p className="small text-muted mb-0">
          This action cannot be undone. All active proposals for this job will also be affected.
        </p>
      </Modal>
    </div>
  );
}
