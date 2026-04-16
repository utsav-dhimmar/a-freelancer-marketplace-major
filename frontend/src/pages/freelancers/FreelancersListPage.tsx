import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { freelancerApi } from '../../api';
import { Button, Card, Badge, Spinner, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../constants/currency';
import type { IFreelancer } from '../../types';

export function FreelancersListPage() {
  const [freelancers, setFreelancers] = useState<IFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState('');

  useEffect(() => {
    void loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const data = await freelancerApi.getAll({ skills });
      setFreelancers(data.freelancers);
    } catch (error) {
      console.error('Failed to load freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void loadFreelancers();
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
              placeholder="Search by skills (e.g. React, Node.js)..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
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
          <Spinner size="md" />
        </div>
      ) : (
        <div className="row">
          {freelancers.length === 0 ? (
            <div className="col-12">
              <EmptyState
                title="No freelancers found"
                description="Try adjusting your search criteria or browse all available freelancers."
              />
            </div>
          ) : (
            freelancers.map((freelancer) => (
              <div key={freelancer._id} className="col-md-6 mb-4">
                <Card className="h-100">
                  <h5 className="card-title">{freelancer.title}</h5>
                  <p
                    className="card-text text-muted mb-3"
                    style={{
                      maxHeight: '3rem',
                      overflow: 'hidden',
                    }}
                  >
                    {freelancer.bio}
                  </p>
                  <div className="mb-3">
                    {freelancer.skills.slice(0, 5).map((skill) => (
                      <Badge
                        key={skill}
                        variant="light"
                        className="text-dark me-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">
                      {formatCurrency(freelancer.hourlyRate)}
                      /hr
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
