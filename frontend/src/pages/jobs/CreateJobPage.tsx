import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Card } from '../../components/ui';
import { jobApi } from '../../api';
import { jobSchema, type JobInput } from '../../schemas';

export function CreateJobPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobInput) => {
    try {
      setError(null);
      await jobApi.create({ ...data, skillsRequired: skills });
      navigate('/jobs');
    } catch (err) {
      setError('Failed to create job. Please try again.');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="container py-4">
      <Link to="/jobs" className="text-decoration-none mb-3 d-inline-block">
        &larr; Back to Jobs
      </Link>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card title="Post a New Job">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Job Title"
                {...register('title')}
                error={errors.title?.message}
                placeholder="e.g., Build a React website"
              />

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  {...register('description')}
                  rows={5}
                  placeholder="Describe the job in detail..."
                />
                {errors.description && (
                  <div className="invalid-feedback">
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Skills Required</label>
                <div className="d-flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                  {skills.map((skill) => (
                    <span key={skill} className="badge bg-primary me-1 mb-1">
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

              <div className="row">
                <div className="col-md-6">
                  <Select
                    label="Budget Type"
                    {...register('budgetType')}
                    options={[
                      { value: 'fixed', label: 'Fixed Price' },
                      { value: 'hourly', label: 'Hourly Rate' },
                    ]}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Budget Amount ($)"
                    type="number"
                    {...register('budgetAmount', { valueAsNumber: true })}
                    error={errors.budgetAmount?.message}
                  />
                </div>
              </div>

              <Input
                label="Deadline"
                type="date"
                {...register('deadline')}
                error={errors.deadline?.message}
              />

              <div className="d-flex gap-2">
                <Button type="submit" isLoading={isSubmitting}>
                  Post Job
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/jobs')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
