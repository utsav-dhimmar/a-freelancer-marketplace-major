import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema, type RegisterInput } from '../../schemas';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'client',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null);
      await registerUser(data.email, data.username, data.password, data.role);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body px-4 py-5">
              <Link
                to="/"
                className="navbar-brand fw-bold text-decoration-none mb-3 d-inline-flex align-items-baseline gap-1"
              >
                <span className="text-dark">Freelance</span>
                <span className="text-primary">Hub</span>
              </Link>
              <h1 className="h4 fw-bold mb-1">Create account</h1>
              <p className="text-muted mb-4">
                Join the community of exceptional freelancers and clients.
              </p>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="d-flex flex-column gap-3"
              >
                <div className="d-flex gap-2">
                  {[
                    {
                      value: 'client',
                      label: 'Client',
                      description: 'I want to hire talent',
                    },
                    {
                      value: 'freelancer',
                      label: 'Freelancer',
                      description: 'I want to find work',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`btn btn-outline-primary flex-fill text-start ${
                        selectedRole === option.value ? 'active' : ''
                      }`}
                    >
                      <input
                        {...register('role')}
                        type="radio"
                        value={option.value}
                        className="btn-check"
                        autoComplete="off"
                      />
                      <div className="fw-semibold">{option.label}</div>
                      <small className="text-muted">{option.description}</small>
                    </label>
                  ))}
                </div>

                {errors.role && (
                  <p className="text-danger small mb-0">
                    {errors.role.message}
                  </p>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  {...register('username')}
                  error={errors.username?.message}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="text-uppercase"
                >
                  Create Account
                </Button>
              </form>

              <p className="text-center text-muted mt-4 mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
