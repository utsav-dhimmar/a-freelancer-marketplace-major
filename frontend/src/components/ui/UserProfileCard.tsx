import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';
import { Card } from './Card';
import { Badge } from './Badge';
import { STATIC_URL } from '../../api';


interface UserProfileCardProps {
  user: any; // Using any because user can be populated or not, and can be IUser or IFreelancer with nested User
  variant?: 'mini' | 'full' | 'sidebar';
  className?: string;
  showBio?: boolean;
}

export function UserProfileCard({
  user,
  variant = 'full',
  className = '',
  showBio = true,
}: UserProfileCardProps) {
  if (!user) return null;

  // Normalize user data (handles both IUser and populated objects)
  const userData = user.user || user; // IFreelancer has user nested, IUser is flat
  const userId = userData._id || userData.id;
  const name = userData.fullname || userData.username || 'Anonymous User';
  const profilePicture = userData.profilePicture;
  const rating = user.rating || userData.clientRating || 0;
  const reviewCount = user.reviewCount || userData.clientReviewCount || 0;
  const role = userData.role;
  const title = user.title || (role === 'client' ? 'Client' : 'Freelancer');
  const bio = user.bio || '';

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  const Avatar = () => (
    <Link
      to={`/profile/${userId}`}
      className={`rounded-circle bg-light d-flex align-items-center justify-content-center border overflow-hidden text-decoration-none`}
      style={{
        width: variant === 'mini' ? '40px' : '64px',
        height: variant === 'mini' ? '40px' : '64px',
        fontSize: variant === 'mini' ? '14px' : '20px',
        fontWeight: 'bold',
        color: '#6c757d'
      }}
    >
      {profilePicture ? (
        <img src={`${STATIC_URL}${profilePicture}`} alt={name} className="w-100 h-100 object-fit-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </Link>
  );

  if (variant === 'mini') {
    return (
      <div className={`d-flex align-items-center gap-3 ${className}`}>
        <Avatar />
        <div>
          <Link to={`/profile/${userId}`} className="text-decoration-none text-dark">
            <h6 className="mb-0">{name}</h6>
          </Link>
          <div className="d-flex align-items-center gap-2 small">
            <StarRating value={rating} size="sm" readonly />
            <span className="text-muted">({reviewCount})</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Card className={`border-0 shadow-sm ${className}`}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <Avatar />
          <div>
            <Link to={`/profile/${userId}`} className="text-decoration-none text-dark">
              <h6 className="mb-0">{name}</h6>
            </Link>
            <div className="text-muted small mb-1">{title}</div>
            <div className="d-flex align-items-center gap-2 small">
              <StarRating value={rating} size="sm" readonly />
              <span className="text-muted">({reviewCount})</span>
            </div>
          </div>
        </div>
        {showBio && bio && (
          <p className="small text-muted mb-0 text-truncate-3">
            {bio}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className={`border-0 shadow-sm p-4 ${className}`}>
      <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
        <Avatar />
        <div className="flex-fill text-center text-md-start">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start gap-2 mb-2">
            <div>
              <Link to={`/profile/${userId}`} className="text-decoration-none text-dark">
                <h4 className="mb-0">{name}</h4>
              </Link>
              <div className="text-muted mb-2">{title}</div>
            </div>
            <Badge variant={role === 'client' ? 'primary' : 'success'}>
              {role.toUpperCase()}
            </Badge>
          </div>

          <div className="d-flex flex-wrap justify-content-center justify-content-md-start align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <StarRating value={rating} readonly />
              <span className="fw-semibold">{rating.toFixed(1)}</span>
              <span className="text-muted small">({reviewCount} reviews)</span>
            </div>
          </div>

          {showBio && bio && (
            <p className="text-muted mb-0">
              {bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
