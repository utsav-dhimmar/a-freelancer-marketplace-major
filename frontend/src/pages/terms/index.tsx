import { Link } from "react-router-dom";

const terms = [
	{
		title: "Platform Role",
		content:
			"FreelanceHub is strictly a marketplace platform that facilitates connections between freelancers and clients. We provide the digital space for interaction but are not a party to any agreements, contracts, or work delivered between users.",
	},
	{
		title: "User Interactions",
		content:
			"The platform has no involvement in, and is not responsible for, the actual interactions, negotiations, or performance of services between freelancers and clients. All engagements are solely at the risk of the participating parties.",
	},
	{
		title: "Harmful Material Policy",
		content:
			"We are fully committed to maintaining a safe environment for all parties. Posting harmful, illegal, or offensive material is strictly prohibited. We actively support users in reporting such content to ensure a professional marketplace.",
	},
	{
		title: "Content Removal & Suspension",
		content:
			"The platform reserves the absolute right to remove any post, project, or user account that violates our safety guidelines or contains harmful material. This action may be taken at our sole discretion without prior notice.",
	},
	{
		title: "General Conduct",
		content:
			"Users are expected to behave professionally, honor their commitments, and communicate respectfully. Failure to maintain these standards may result in limited access to platform features.",
	},
];

export default function TermsPage() {
	return (
		<div className="container py-5">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					<div className="card border-0 shadow-sm">
						<div className="card-body p-5">
							<div className="text-center mb-5">
								<Link
									to="/"
									className="navbar-brand fw-bold text-decoration-none d-inline-flex align-items-baseline gap-1 mb-3"
								>
									<span className="text-dark">Freelance</span>
									<span className="text-primary">Hub</span>
								</Link>
								<h1 className="h3 fw-bold">
									Terms and Conditions
								</h1>
								<p className="text-muted">
									Last updated: March 2026
								</p>
							</div>

							<div className="d-flex flex-column gap-4">
								{terms.map((term, index) => (
									<div key={index}>
										<h5 className="fw-semibold text-dark">
											{term.title}
										</h5>
										<p className="text-muted mb-0">
											{term.content}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
