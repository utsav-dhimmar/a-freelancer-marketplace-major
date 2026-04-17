import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi, reviewApi } from '../../api';
import { Card, StarRating, DateDisplay, Spinner, Button, Badge } from '../../components/ui';
import type { IUser, IFreelancer, IReview } from '../../types';
import { formatCurrency } from '../../constants/currency';

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profileData, setProfileData] = useState<{ user: IUser; freelancer: IFreelancer | null } | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authApi.getPublicProfile(id!);
      setProfileData(data);

      // Fetch reviews received by this user
      const reviewData = await reviewApi.getByUser(id!);
      setReviews(reviewData);
    } catch (error) {
      console.error('Failed to load profile:', error);
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

  if (!profileData) {
    return (
      <div className="container py-5 text-center">
        <p>User profile not found</p>
        <Link to="/" className="btn btn-outline-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const { user, freelancer } = profileData;
  const isFreelancer = user.role === 'freelancer';
  const name = user.fullname || user.username;
  const rating = isFreelancer ? freelancer?.rating : user.clientRating;
  const reviewCount = isFreelancer ? freelancer?.reviewCount : user.clientReviewCount;

  return (
    <div className="container py-4">
      <Link
        to={isFreelancer ? "/freelancers" : "/jobs"}
        className="text-decoration-none mb-3 d-inline-block text-muted"
      >
        &larr; Back to {isFreelancer ? "Freelancers" : "Jobs"}
      </Link>

      <div className="row">
        <div className="col-lg-8">
          <Card className="mb-4">
            <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4 mb-3">
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center border overflow-hidden"
                style={{ width: '100px', height: '100px' }}
              >
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:4000${user.profilePicture}`} 
                    alt={name} 
                    className="w-100 h-100 object-fit-cover" 
                  />
                ) : (
                  <span className="fs-2 fw-bold text-muted">{name[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-fill text-center text-md-start">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start gap-2 mb-2">
                  <div>
                    <h2 className="mb-0">{name}</h2>
                    <div className="text-muted mb-1">{isFreelancer ? freelancer?.title : 'Client'}</div>
                    <Badge variant={user.role === 'client' ? 'primary' : 'success'}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-md-end">
                    <StarRating value={rating || 0} readonly size="sm" />
                    <div className="small text-muted">
                      {rating?.toFixed(1) || '0.0'} ({reviewCount || 0} reviews)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isFreelancer && freelancer && (
              <>
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
              </>
            )}
          </Card>

          {/* Reviews Section */}
          <div className="mt-5">
            <h4 className="mb-4">{isFreelancer ? "Client Feedback" : "Freelancer Feedback"}</h4>
            {reviews.length === 0 ? (
              <Card>
                <div className="text-center py-4 text-muted">
                  No reviews yet for this {user.role}.
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
                          : 'User'}
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
          <Card title="Quick Stats" className="sticky-top" style={{ top: '1rem' }}>
            {isFreelancer && freelancer && (
              <div className="mb-4">
                <small className="text-muted d-block mb-1">Hourly Rate</small>
                <p className="mb-4 fw-bold fs-3 text-primary">
                  {formatCurrency(freelancer.hourlyRate)}<span className="fs-6 text-muted">/hr</span>
                </p>
              </div>
            )}

            <div className="bg-light rounded p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">
                  {isFreelancer ? "Total Jobs" : "Jobs Posted"}
                </span>
                <span className="fw-bold">{isFreelancer ? freelancer?.totalJobs || 0 : "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Reviews</span>
                <span className="fw-bold">{reviewCount || 0}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Member Since</span>
                <span className="fw-bold"><DateDisplay date={user.createdAt} /></span>
              </div>
            </div>

            <Button className="w-100" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
