import type { SyntheticEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api';
import {
  Button,
  Badge,
  Spinner,
  EmptyState,
  Input,
  Select,
} from '../../components/ui';
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
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState<JobStatus | ''>('open');
  const [difficulty, setDifficulty] = useState<
    'entry' | 'intermediate' | 'expert' | ''
  >('');
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly' | ''>('');
  const [minBudget, setMinBudget] = useState<number | ''>('');
  const [maxBudget, setMaxBudget] = useState<number | ''>('');

  useEffect(() => {
    void loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (skills) params.skills = skills;
      if (status) params.status = status;
      if (difficulty) params.difficulty = difficulty;
      if (budgetType) params.budgetType = budgetType;
      if (minBudget !== '') params.minBudget = Number(minBudget);
      if (maxBudget !== '') params.maxBudget = Number(maxBudget);

      // Use search endpoint if any filter is present, otherwise use getAll
      let data;
      const hasFilters =
        skills || difficulty || budgetType || minBudget !== '' || maxBudget !== '';
      
      if (hasFilters) {
        data = await jobApi.search(params);
      } else {
        data = await jobApi.getAll({ status: status || undefined });
      }
      
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
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Input
                label="Skills (comma separated)"
                type="text"
                placeholder="React, Node.js, TypeScript..."
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <Select
                label="Status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as JobStatus | '')
                }
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
            <div className="col-12 col-md-3">
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(
                    event.target.value as
                      | 'entry'
                      | 'intermediate'
                      | 'expert'
                      | '',
                  )
                }
                options={[
                  { value: '', label: 'All Levels' },
                  { value: 'entry', label: 'Entry' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'expert', label: 'Expert' },
                ]}
              />
            </div>
            <div className="col-12 col-md-3">
              <Select
                label="Budget Type"
                value={budgetType}
                onChange={(event) =>
                  setBudgetType(event.target.value as 'fixed' | 'hourly' | '')
                }
                options={[
                  { value: '', label: 'Any Type' },
                  { value: 'fixed', label: 'Fixed Price' },
                  { value: 'hourly', label: 'Hourly Rate' },
                ]}
              />
            </div>
            <div className="col-12 col-md-3">
              <Input
                label="Min Budget"
                type="number"
                placeholder="Min"
                value={minBudget}
                onChange={(event) =>
                  setMinBudget(
                    event.target.value === '' ? '' : Number(event.target.value),
                  )
                }
              />
            </div>
            <div className="col-12 col-md-3">
              <Input
                label="Max Budget"
                type="number"
                placeholder="Max"
                value={maxBudget}
                onChange={(event) =>
                  setMaxBudget(
                    event.target.value === '' ? '' : Number(event.target.value),
                  )
                }
              />
            </div>
            <div className="col-12 col-md-3 d-grid align-items-end">
              <Button type="submit" className="text-uppercase">
                Apply Filters
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
                        {job.deadline && (
                          <p className="mb-0 text-muted small">
                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                          </p>
                        )}
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
