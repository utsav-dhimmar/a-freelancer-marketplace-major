import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freelancerApi, reviewApi } from '../../api';
import { Card, StarRating, DateDisplay, Spinner, Button, Modal } from '../../components/ui';
import type { IFreelancer, IReview } from '../../types';
import { formatCurrency } from '../../constants/currency';

export function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [freelancer, setFreelancer] = useState<IFreelancer | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert Modal state
  const [showContactAlert, setShowContactAlert] = useState(false);

  useEffect(() => {
    if (id) loadFreelancer();
  }, [id]);

  const loadFreelancer = async () => {
    try {
      const data = await freelancerApi.getById(id!);
      setFreelancer(data);

      // Fetch reviews received by this freelancer's user
      if (data.user) {
        const userId = typeof data.user === 'object' ? data.user._id : data.user;
        const reviewData = await reviewApi.getByUser(userId);
        setReviews(reviewData);
      }
    } catch (error) {
      console.error('Failed to load freelancer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="container py-5 text-center">
        <p>Freelancer not found</p>
        <Link to="/freelancers" className="btn btn-outline-primary">
          Back to Freelancers
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link
        to="/freelancers"
        className="text-decoration-none mb-3 d-inline-block text-muted"
      >
        &larr; Back to Freelancers
      </Link>

      <div className="row">
        <div className="col-lg-8">
          <Card className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0">{freelancer.title}</h2>
              <div className="text-end">
                <StarRating value={freelancer.rating || 0} readonly size="sm" />
                <div className="small text-muted">
                  {freelancer.rating?.toFixed(1) || '0.0'} ({freelancer.reviewCount || 0} reviews)
                </div>
              </div>
            </div>

            <p className="text-muted mb-4" style={{ whiteSpace: 'pre-wrap' }}>
              {freelancer.bio}
            </p>

            <h5 className="mb-3">Skills</h5>
            <div className="mb-4 d-flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <span key={skill} className="badge bg-light text-primary border border-primary px-3 py-2">
                  {skill}
                </span>
              ))}
            </div>

            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
              <div className="mt-5">
                <h5 className="mb-4">Portfolio</h5>
                <div className="row">
                  {freelancer.portfolio.map((item, index) => (
                    <div key={index} className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title fw-bold">{item.title}</h6>
                          <p className="card-text text-muted small">{item.desc}</p>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-link text-decoration-none p-0"
                            >
                              Explore Project &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Reviews Section */}
          <div className="mt-5">
            <h4 className="mb-4">Client Feedback</h4>
            {reviews.length === 0 ? (
              <Card>
                <div className="text-center py-4 text-muted">
                  No reviews yet for this freelancer.
                </div>
              </Card>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <div className="d-flex justify-content-between mb-2">
                      <div className="fw-bold">
                        {typeof review.reviewer === 'object'
                          ? (review.reviewer as any).fullname
                          : 'Client'}
                      </div>
                      <DateDisplay date={review.createdAt} className="small text-muted" />
                    </div>
                    <StarRating value={review.rating} readonly size="sm" />
                    <p className="mt-3 mb-0 text-muted italic">
                      "{review.comment || 'No comment provided.'}"
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <Card title="Freelancer Stats" className="sticky-top" style={{ top: '1rem' }}>
            <div className="mb-4">
              <small className="text-muted d-block mb-1">Hourly Rate</small>
              <p className="mb-4 fw-bold fs-3 text-primary">
                {formatCurrency(freelancer.hourlyRate)}<span className="fs-6 text-muted">/hr</span>
              </p>
            </div>

            <div className="bg-light rounded p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Total Jobs</span>
                <span className="fw-bold">{freelancer.totalJobs || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Review Count</span>
                <span className="fw-bold">{freelancer.reviewCount || 0}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Portfolio Items</span>
                <span className="fw-bold">{freelancer.portfolio?.length || 0}</span>
              </div>
            </div>

            <Button className="w-100" onClick={() => setShowContactAlert(true)}>
              Contact Me
            </Button>
          </Card>
        </div>
      </div>

      {/* Contact Alert Modal */}
      <Modal
        isOpen={showContactAlert}
        title="Contact Freelancer"
        onClose={() => setShowContactAlert(false)}
      >
        <div className="text-center py-3">
          <i className="bi bi-info-circle text-primary fs-1 mb-3 d-block"></i>
          <p className="mb-0">Contacting freelancer functionality is coming soon!</p>
          <small className="text-muted">Stay tuned for updates.</small>
        </div>
      </Modal>
    </div>
  );
}
