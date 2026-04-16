import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import {
  ProtectedRoute,
  AdminProtectedRoute,
  AdminGuestRoute,
  GuestRoute,
  UserLayout,
  AdminRootLayout,
} from './components/layout';

const HomePage = lazy(() =>
  import('./pages/jobs/HomePage').then((module) => ({
    default: module.HomePage,
  })),
);
const JobsListPage = lazy(() =>
  import('./pages/jobs/JobsListPage').then((module) => ({
    default: module.JobsListPage,
  })),
);
const JobDetailPage = lazy(() =>
  import('./pages/jobs/JobDetailPage').then((module) => ({
    default: module.JobDetailPage,
  })),
);
const CreateJobPage = lazy(() =>
  import('./pages/jobs/CreateJobPage').then((module) => ({
    default: module.CreateJobPage,
  })),
);
const FreelancersListPage = lazy(() =>
  import('./pages/freelancers/FreelancersListPage').then((module) => ({
    default: module.FreelancersListPage,
  })),
);
const FreelancerProfilePage = lazy(() =>
  import('./pages/freelancers/FreelancerProfilePage').then((module) => ({
    default: module.FreelancerProfilePage,
  })),
);
const MyProfilePage = lazy(() =>
  import('./pages/freelancers/MyProfilePage').then((module) => ({
    default: module.MyProfilePage,
  })),
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  })),
);
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
const ProposalsPage = lazy(() =>
  import('./pages/dashboard/ProposalsPage').then((module) => ({
    default: module.ProposalsPage,
  })),
);
const ProposalDetailPage = lazy(() =>
  import('./pages/dashboard/ProposalDetailPage').then((module) => ({
    default: module.ProposalDetailPage,
  })),
);
const ContractsPage = lazy(() =>
  import('./pages/dashboard/ContractsPage').then((module) => ({
    default: module.ContractsPage,
  })),
);
const ChatPage = lazy(() =>
  import('./pages/dashboard/ChatPage').then((module) => ({
    default: module.ChatPage,
  })),
);
const MyJobsPage = lazy(() =>
  import('./pages/dashboard/MyJobsPage').then((module) => ({
    default: module.MyJobsPage,
  })),
);
const JobProposalsPage = lazy(() =>
  import('./pages/dashboard/JobProposalsPage').then((module) => ({
    default: module.JobProposalsPage,
  })),
);

// ─── Admin Pages ──────────────────────────────────────────────────
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((module) => ({
    default: module.AdminUsersPage,
  })),
);
const AdminJobsPage = lazy(() =>
  import('./pages/admin/AdminJobsPage').then((module) => ({
    default: module.AdminJobsPage,
  })),
);
const AdminContractsPage = lazy(() =>
  import('./pages/admin/AdminContractsPage').then((module) => ({
    default: module.AdminContractsPage,
  })),
);
const AdminReviewsPage = lazy(() =>
  import('./pages/admin/AdminReviewsPage').then((module) => ({
    default: module.AdminReviewsPage,
  })),
);

const ProfilePage = lazy(() =>
  import('./pages/auth/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
);

const TermsPage = lazy(() =>
  import('./pages/terms').then((module) => ({
    default: module.default,
  })),
);

export const routes: RouteObject[] = [
  // ─── User Routes (with Navbar + Footer) ─────────────────────
  {
    element: <UserLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      { path: '/jobs', element: <JobsListPage /> },
      { path: '/jobs/:id', element: <JobDetailPage /> },
      {
        path: '/jobs/create',
        element: (
          <ProtectedRoute allowedRoles={['client']}>
            <CreateJobPage />
          </ProtectedRoute>
        ),
      },
      { path: '/freelancers', element: <FreelancersListPage /> },
      { path: '/freelancers/:id', element: <FreelancerProfilePage /> },
      { path: '/terms', element: <TermsPage /> },
      {
        path: '/freelancers/me',
        element: (
          <ProtectedRoute allowedRoles={['freelancer']}>
            <MyProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/proposals',
        element: (
          <ProtectedRoute allowedRoles={['freelancer', 'client']}>
            <ProposalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/proposals/:id',
        element: (
          <ProtectedRoute allowedRoles={['freelancer']}>
            <ProposalDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/jobs',
        element: (
          <ProtectedRoute allowedRoles={['client']}>
            <MyJobsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/jobs/:id/proposals',
        element: (
          <ProtectedRoute allowedRoles={['client']}>
            <JobProposalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/contracts',
        element: (
          <ProtectedRoute>
            <ContractsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/contracts/:id/chat',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ─── Admin Routes (NO Navbar / Footer) ──────────────────────
  {
    element: <AdminRootLayout />,
    children: [
      {
        path: '/admin/login',
        element: (
          <AdminGuestRoute>
            <AdminLoginPage />
          </AdminGuestRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <AdminProtectedRoute>
            <AdminUsersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: '/admin/jobs',
        element: (
          <AdminProtectedRoute>
            <AdminJobsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: '/admin/contracts',
        element: (
          <AdminProtectedRoute>
            <AdminContractsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: '/admin/reviews',
        element: (
          <AdminProtectedRoute>
            <AdminReviewsPage />
          </AdminProtectedRoute>
        ),
      },
    ],
  },
];
