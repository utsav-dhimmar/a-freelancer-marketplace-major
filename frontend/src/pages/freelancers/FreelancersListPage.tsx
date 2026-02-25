import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { freelancerApi } from '../../api';
import { Card, Button } from '../../components/ui';
import type { IFreelancer } from '../../types';

export function FreelancersListPage() {
  const [freelancers, setFreelancers] = useState<IFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const data = await freelancerApi.getAll({ search });
      setFreelancers(data.freelancers);
    } catch (error) {
      console.error('Failed to load freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFreelancers();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Browse Freelancers</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="row g-3">
          <div className="col-md-10">
            <input
              type="text"
              className="form-control"
              placeholder="Search by skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <Button type="submit" className="w-100">
              Search
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : (
        <div className="row">
          {freelancers.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">No freelancers found</p>
            </div>
          ) : (
            freelancers.map((freelancer) => (
              <div key={freelancer._id} className="col-md-6 mb-4">
                <Card className="h-100">
                  <h5 className="card-title">{freelancer.title}</h5>
                  <p
                    className="card-text text-muted mb-3"
                    style={{ maxHeight: '3rem', overflow: 'hidden' }}
                  >
                    {freelancer.bio}
                  </p>
                  <div className="mb-3">
                    {freelancer.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="badge bg-light text-dark me-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">
                      ${freelancer.hourlyRate}/hr
                    </span>
                    <Link to={`/freelancers/${freelancer._id}`}>
                      <Button variant="outline-primary" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
