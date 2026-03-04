import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../../components/ui';
import { authApi, STATIC_URL } from '../../api';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'danger';
    text: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    setMessage(null);
    try {
      await authApi.updateProfilePicture(formData);
      await refreshUser();
      setMessage({
        type: 'success',
        text: 'Profile picture updated successfully!',
      });
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      setMessage({ type: 'danger', text: 'Failed to update profile picture.' });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h2 className="mb-4">Account Settings</h2>

          {message && (
            <div className={`alert alert-${message.type} mb-4`} role="alert">
              {message.text}
            </div>
          )}

          <Card className="mb-4">
            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="position-relative">
                {user.profilePicture ? (
                  <img
                    src={`${STATIC_URL}${user.profilePicture}`}
                    alt={user.username}
                    className="rounded-circle border"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border"
                    style={{
                      width: '100px',
                      height: '100px',
                      fontSize: '2rem',
                    }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <label
                  className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle border shadow-sm p-1"
                  style={{ width: '32px', height: '32px' }}
                >
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <i className="bi bi-camera"></i>
                  {uploading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-camera"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                      <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                    </svg>
                  )}
                </label>
              </div>
              <div>
                <h3 className="h5 mb-1">{user.fullname || user.username}</h3>
                <p className="text-muted mb-0">{user.email}</p>
                <span className="badge bg-light text-primary border mt-2 text-uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              <Input label="Username" value={user.username} readOnly disabled />
              <Input
                label="Full Name"
                value={user.fullname || user.name || ''}
                readOnly
                disabled
              />
              <Input
                label="Email Address"
                value={user.email}
                readOnly
                disabled
              />
              <div className="mt-2 p-3 bg-light rounded border">
                <p className="small text-muted mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Account type: <strong>{user.role}</strong>. Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </Card>

          <div className="d-flex gap-2">
            {user.role === 'freelancer' && (
              <Button
                variant="outline-primary"
                onClick={() => (window.location.href = '/freelancers/me')}
                className="flex-fill"
              >
                Manage Professional Profile
              </Button>
            )}
            <Button
              variant="outline-secondary"
              onClick={() => window.history.back()}
              className="flex-fill"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
