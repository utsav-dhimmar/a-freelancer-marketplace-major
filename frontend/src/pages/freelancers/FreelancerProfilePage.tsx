import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freelancerApi } from '../../api';
import { Card } from '../../components/ui';
import type { IFreelancer } from '../../types';
import { formatCurrency } from '../../constants/currency';

export function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [freelancer, setFreelancer] = useState<IFreelancer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadFreelancer();
  }, [id]);

  const loadFreelancer = async () => {
    try {
      const data = await freelancerApi.getById(id!);
      setFreelancer(data);
    } catch (error) {
      console.error('Failed to load freelancer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="container py-5 text-center">
        <p>Freelancer not found</p>
        <Link to="/freelancers">Back to Freelancers</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link
        to="/freelancers"
        className="text-decoration-none mb-3 d-inline-block"
      >
        &larr; Back to Freelancers
      </Link>

      <div className="row">
        <div className="col-lg-8">
          <Card>
            <h2>{freelancer.title}</h2>
            <p className="text-muted">{freelancer.bio}</p>

            <h5 className="mt-4">Skills</h5>
            <div className="mb-4">
              {freelancer.skills.map((skill) => (
                <span key={skill} className="badge bg-primary me-1 mb-1">
                  {skill}
                </span>
              ))}
            </div>

            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
              <>
                <h5>Portfolio</h5>
                <div className="row">
                  {freelancer.portfolio.map((item, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">{item.title}</h6>
                          <p className="card-text small">{item.description}</p>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="small"
                            >
                              View Project
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="Contact">
            <div className="mb-3">
              <small className="text-muted">Hourly Rate</small>
              <p className="mb-0 fw-bold fs-5">
                {formatCurrency(freelancer.hourlyRate)}/hr
              </p>
            </div>
            <div className="mb-3">
              <small className="text-muted">Portfolio Items</small>
              <p className="mb-0">{freelancer.portfolio?.length || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
