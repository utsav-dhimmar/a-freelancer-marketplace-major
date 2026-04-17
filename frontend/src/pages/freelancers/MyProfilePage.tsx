import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { freelancerApi, authApi, STATIC_URL } from '../../api';
import { Card, Button, Input, TextArea, Modal } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { IFreelancer, IPortfolioItem } from '../../types';
import { portfolioItemSchema } from '../../schemas';
import { CURRENCY, formatCurrency } from '../../constants/currency';

export function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const [freelancer, setFreelancer] = useState<IFreelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    skills: [] as string[],
    hourlyRate: 0,
  });
  const [skillInput, setSkillInput] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [portfolioItem, setPortfolioItem] = useState<IPortfolioItem>({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
  });
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [portfolioErrors, setPortfolioErrors] = useState<Record<string, string>>({});

  // Deactivate confirmation
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    loadFreelancer();
  }, []);

  const loadFreelancer = async () => {
    try {
      const data = await freelancerApi.getMe();
      setFreelancer(data);
      setFormData({
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        hourlyRate: data.hourlyRate,
      });
      setIsCreating(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsCreating(true);
        setEditing(true);
      } else {
        console.error('Failed to load freelancer:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!freelancer && !isCreating) return;
    setSaving(true);
    try {
      if (isCreating) {
        await freelancerApi.create(formData);
      } else if (freelancer) {
        await freelancerApi.update(freelancer._id, formData);
      }
      setEditing(false);
      setIsCreating(false);
      loadFreelancer();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateProfile = () => {
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    setDeactivating(true);
    try {
      await freelancerApi.deleteProfile();
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to deactivate profile:', error);
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const handlePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      await authApi.updateProfilePicture(formData);
      await refreshUser();
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload picture:', error);
    } finally {
      setUploadingPic(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const validatePortfolioItem = () => {
    const result = portfolioItemSchema.safeParse(portfolioItem);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setPortfolioErrors(errors);
      return false;
    }

    setPortfolioErrors({});
    return true;
  };

  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePortfolioItem()) return;

    try {
      await freelancerApi.addPortfolioItem({
        ...portfolioItem,
        desc: portfolioItem.description,
      } as any);
      setShowPortfolioForm(false);
      setPortfolioItem({ title: '', description: '', imageUrl: '', link: '' });
      setPortfolioErrors({});
      loadFreelancer();
    } catch (error) {
      console.error('Failed to add portfolio item:', error);
    }
  };

  const handleDeletePortfolioItem = async (index: number) => {
    try {
      await freelancerApi.deletePortfolioItem(index);
      loadFreelancer();
    } catch (error) {
      console.error('Failed to delete portfolio item:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!freelancer && !isCreating) {
    return (
      <div className="container py-5 text-center">
        <p>There was an error loading your profile.</p>
        <Link to="/freelancers">Browse Freelancers</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isCreating ? 'Create Profile' : 'My Profile'}</h2>
        {!isCreating && (
          <Button
            variant="outline-primary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        )}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <Card>
            {editing ? (
              <>
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <TextArea
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                />
                <div className="">
                  <label className="form-label">Skills</label>
                  <div className="d-flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addSkill())
                      }
                      placeholder="Add a skill"
                    />
                    <Button
                      type="button"
                      variant="outline-primary"
                      onClick={addSkill}
                    >
                      Add
                    </Button>
                  </div>
                  <div>
                    {formData.skills.map((skill) => (
                      <span key={skill} className="badge bg-primary me-1">
                        {skill}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.5rem' }}
                          onClick={() => removeSkill(skill)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <Input
                  label={`Hourly Rate (${CURRENCY.symbol})`}
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hourlyRate: Number(e.target.value),
                    })
                  }
                />
                <Button onClick={handleUpdate} isLoading={saving}>
                  Save Changes
                </Button>
              </>
            ) : (
              freelancer && (
                <>
                  <h3>{freelancer.title}</h3>
                  <p className="text-muted">{freelancer.bio}</p>
                  <h5 className="mt-4">Skills</h5>
                  <div className="mb-4">
                    {freelancer.skills.map((skill) => (
                      <span key={skill} className="badge bg-primary me-1 mb-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )
            )}
          </Card>

          <Card className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Portfolio</h5>
              <Button
                size="sm"
                onClick={() => {
                  setShowPortfolioForm(!showPortfolioForm);
                  setPortfolioErrors({});
                }}
              >
                {showPortfolioForm ? 'Cancel' : 'Add Item'}
              </Button>
            </div>

            {showPortfolioForm && (
              <form
                onSubmit={handleAddPortfolioItem}
                className="mb-4 p-3 border rounded"
              >
                <Input
                  label="Title"
                  value={portfolioItem.title}
                  onChange={(e) =>
                    setPortfolioItem({
                      ...portfolioItem,
                      title: e.target.value,
                    })
                  }
                  error={portfolioErrors.title}
                />
                <TextArea
                  label="Description"
                  value={portfolioItem.description}
                  onChange={(e) =>
                    setPortfolioItem({
                      ...portfolioItem,
                      description: e.target.value,
                    })
                  }
                  error={portfolioErrors.description}
                />
                <Input
                  label="Image URL"
                  value={portfolioItem.imageUrl || ''}
                  onChange={(e) =>
                    setPortfolioItem({
                      ...portfolioItem,
                      imageUrl: e.target.value,
                    })
                  }
                  error={portfolioErrors.imageUrl}
                  placeholder="https://example.com/image.jpg"
                />
                <Input
                  label="Project Link"
                  value={portfolioItem.link || ''}
                  onChange={(e) =>
                    setPortfolioItem({ ...portfolioItem, link: e.target.value })
                  }
                  error={portfolioErrors.link}
                  placeholder="https://example.com/project"
                />
                <Button type="submit">Add to Portfolio</Button>
              </form>
            )}

            <div className="row">
              {freelancer?.portfolio?.map((item, index) => (
                <div key={index} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">{item.title}</h6>
                      <p className="card-text small">
                        {item.description || (item as any).desc}
                      </p>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="img-fluid rounded mb-2"
                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                        />
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="small me-2"
                        >
                          View Project
                        </a>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeletePortfolioItem(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!freelancer?.portfolio || freelancer.portfolio.length === 0) &&
                !showPortfolioForm && (
                  <p className="text-muted">No portfolio items yet.</p>
                )}
            </div>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="Profile Picture">
            <div className="text-center mb-3">
              {user?.profilePicture ? (
                <img
                  src={`${STATIC_URL}${user.profilePicture}`}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  className="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '150px',
                    height: '150px',
                    fontSize: '3rem',
                    color: 'white',
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-center">
              <label className="btn btn-outline-primary btn-sm">
                {uploadingPic ? 'Uploading...' : 'Change Picture'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingPic}
                />
              </label>
            </div>
          </Card>

          <Card className="mt-3" title="Stats">
            <div className="mb-3">
              <small className="text-muted">Hourly Rate</small>
              <p className="mb-0 fw-bold fs-5">
                {formatCurrency(
                  freelancer?.hourlyRate || formData.hourlyRate || 0,
                )}
                /hr
              </p>
            </div>
            <div className="mb-3">
              <small className="text-muted">Portfolio Items</small>
              <p className="mb-0">{freelancer?.portfolio?.length || 0}</p>
            </div>
          </Card>

          {!isCreating && (
            <Card className="mt-3 border-danger">
              <h5 className="text-danger">Danger Zone</h5>
              <p className="small text-muted mb-3">
                Retire your freelancer profile. This does not delete your main user account.
              </p>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDeactivateProfile}
                className="w-100"
              >
                Deactivate Freelancer Profile
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        title="Deactivate Profile"
        variant="confirm"
        confirmText="Deactivate"
        onClose={() => !deactivating && setShowDeactivateModal(false)}
        onConfirm={confirmDeactivate}
        isLoading={deactivating}
      >
        <p>Are you sure you want to deactivate your freelancer profile?</p>
        <p className="small text-muted mb-0">
          This will hide your profile from search results and you will not be able to apply for new jobs. 
          Your user account will remain active.
        </p>
      </Modal>
    </div>
  );
}
