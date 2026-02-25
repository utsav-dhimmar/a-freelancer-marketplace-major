import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./components/layout";

const HomePage = lazy(() =>
	import("./pages/jobs/HomePage").then(module => ({
		default: module.HomePage,
	})),
);
const JobsListPage = lazy(() =>
	import("./pages/jobs/JobsListPage").then(module => ({
		default: module.JobsListPage,
	})),
);
const JobDetailPage = lazy(() =>
	import("./pages/jobs/JobDetailPage").then(module => ({
		default: module.JobDetailPage,
	})),
);
const CreateJobPage = lazy(() =>
	import("./pages/jobs/CreateJobPage").then(module => ({
		default: module.CreateJobPage,
	})),
);
const FreelancersListPage = lazy(() =>
	import("./pages/freelancers/FreelancersListPage").then(module => ({
		default: module.FreelancersListPage,
	})),
);
const FreelancerProfilePage = lazy(() =>
	import("./pages/freelancers/FreelancerProfilePage").then(module => ({
		default: module.FreelancerProfilePage,
	})),
);
const MyProfilePage = lazy(() =>
	import("./pages/freelancers/MyProfilePage").then(module => ({
		default: module.MyProfilePage,
	})),
);
const LoginPage = lazy(() =>
	import("./pages/auth/LoginPage").then(module => ({
		default: module.LoginPage,
	})),
);
const RegisterPage = lazy(() =>
	import("./pages/auth/RegisterPage").then(module => ({
		default: module.RegisterPage,
	})),
);
const DashboardPage = lazy(() =>
	import("./pages/dashboard/DashboardPage").then(module => ({
		default: module.DashboardPage,
	})),
);
const ProposalsPage = lazy(() =>
	import("./pages/dashboard/ProposalsPage").then(module => ({
		default: module.ProposalsPage,
	})),
);
const ContractsPage = lazy(() =>
	import("./pages/dashboard/ContractsPage").then(module => ({
		default: module.ContractsPage,
	})),
);

export const routes: RouteObject[] = [
	{ path: "/", element: <HomePage /> },
	{ path: "/login", element: <LoginPage /> },
	{ path: "/register", element: <RegisterPage /> },
	{ path: "/jobs", element: <JobsListPage /> },
	{ path: "/jobs/:id", element: <JobDetailPage /> },
	{
		path: "/jobs/create",
		element: (
			<ProtectedRoute allowedRoles={["client"]}>
				<CreateJobPage />
			</ProtectedRoute>
		),
	},
	{ path: "/freelancers", element: <FreelancersListPage /> },
	{ path: "/freelancers/:id", element: <FreelancerProfilePage /> },
	{
		path: "/freelancers/me",
		element: (
			<ProtectedRoute allowedRoles={["freelancer"]}>
				<MyProfilePage />
			</ProtectedRoute>
		),
	},
	{
		path: "/dashboard",
		element: (
			<ProtectedRoute>
				<DashboardPage />
			</ProtectedRoute>
		),
	},
	{
		path: "/dashboard/proposals",
		element: (
			<ProtectedRoute allowedRoles={["freelancer"]}>
				<ProposalsPage />
			</ProtectedRoute>
		),
	},
	{
		path: "/dashboard/contracts",
		element: (
			<ProtectedRoute>
				<ContractsPage />
			</ProtectedRoute>
		),
	},
];
