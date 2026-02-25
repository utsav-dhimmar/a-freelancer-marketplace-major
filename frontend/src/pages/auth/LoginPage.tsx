import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, type LoginInput } from "../../schemas";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const from = (location.state as { from?: Location })?.from?.pathname || "/";

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginInput) => {
		console.log(data);
		try {
			setError(null);
			await login(data.email, data.password);
			navigate(from, { replace: true });
		} catch {
			setError("Invalid email or password");
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
							<h1 className="h4 fw-bold mb-1">Welcome back</h1>
							<p className="text-muted mb-4">
								Sign in to continue to your dashboard.
							</p>

							{error && (
								<div
									className="alert alert-danger py-2"
									role="alert"
								>
									{error}
								</div>
							)}

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="d-flex flex-column gap-3"
							>
								<Input
									label="Email"
									type="email"
									placeholder="you@example.com"
									{...register("email")}
									error={errors.email?.message}
								/>
								<Input
									label="Password"
									type="password"
									placeholder="••••••••"
									{...register("password")}
									error={errors.password?.message}
								/>
								<Button
									type="submit"
									isLoading={isSubmitting}
									className="text-uppercase"
								>
									Sign In
								</Button>
							</form>

							<p className="text-center text-muted mt-4 mb-0">
								Don't have an account?{" "}
								<Link to="/register" className="text-primary">
									Create one
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
