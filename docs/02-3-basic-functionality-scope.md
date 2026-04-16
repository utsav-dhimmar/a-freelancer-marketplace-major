# 2.3 Basic Functionality / Scope

The Freelancer Marketplace provides distinct functional capabilities for three user roles. The scope of the system is defined by the features available to each role and the shared platform services that support them.

## 2.3.1 Client Functionality

The Client is the demand side of the marketplace—businesses, startups, or individuals who need work done and are willing to pay for professional services.

**Registration and Authentication**
Clients can create an account by providing a username, full name, email address, password, and an optional profile picture. Authentication is handled through a JWT-based token system with automatic session renewal, ensuring uninterrupted access without repeated logins.

**Job Posting**
Clients can create detailed job listings that include a title, comprehensive description, difficulty level (entry, intermediate, or expert), budget type (fixed or hourly), budget amount, and a set of required skill tags. This information enables freelancers to evaluate whether a project matches their expertise and compensation expectations.

**Job Management**
Clients have full control over their posted jobs. They can view all listings they have created, update job details such as description or budget, change the job status (for example, closing a job that is no longer active), and permanently delete jobs that are no longer needed.

**Proposal Review and Decision**
When freelancers submit proposals for a job, the client can review each proposal including the freelancer's profile, cover letter, bid amount, and estimated completion timeline. The client can then accept, reject, or shortlist individual proposals. Accepting a proposal triggers two automatic actions: a contract is created between the client and the freelancer, and the job status transitions to in-progress.

**Contract Management**
Clients can view all their contracts organized by status. For contracts in submitted status (where the freelancer has delivered work), the client can either mark the work as complete or raise a dispute if the deliverables do not meet the agreed requirements.

**Real-Time Chat**
Each active contract includes a dedicated chat channel powered by Socket.io. Clients can communicate directly with hired freelancers in real time. All messages are persisted to the database, and read receipts inform both parties when messages have been seen.

**Review Submission**
After a contract is completed, the client can rate the freelancer on a scale of 1 to 5 stars and leave an optional text comment of up to 500 characters. The system enforces a one-review-per-contract constraint to maintain review integrity.

**Profile Management**
Clients can update their personal information, change their profile picture, and view their aggregate client rating as assessed by freelancers they have worked with.

## 2.3.2 Freelancer Functionality

The Freelancer is the supply side of the marketplace—skilled professionals offering services in areas such as web development, design, writing, data analysis, and more.

**Registration and Authentication**
Freelancers register using the same authentication system as clients, providing a username, full name, email, password, and optional profile picture. JWT-based session management with token refresh ensures seamless platform access.

**Profile Creation and Management**
Freelancers build a professional profile that includes a professional title (for example, "Full-Stack Web Developer"), a biographical summary, a list of skills, an hourly rate, and a portfolio of past work. Portfolio items consist of a title, an external link, and a description. Freelancers can update their profile at any time, adding new skills, adjusting their rate, or showcasing new portfolio work.

**Job Discovery**
Freelancers can browse all open job listings on the platform. Search and filter capabilities allow them to narrow results by required skills, difficulty level, and budget range, helping them find projects that match their expertise and compensation expectations.

**Proposal Submission**
Freelancers can submit proposals for any open job. Each proposal includes a cover letter explaining their qualifications and approach, a bid amount, and an estimated completion time. The system enforces a one-proposal-per-freelancer-per-job constraint to maintain bid integrity.

**Proposal Management**
Freelancers can view all proposals they have submitted along with the current status of each: pending (awaiting client review), shortlisted (client is considering), accepted (contract created), or rejected (client declined). Freelancers can also withdraw pending proposals if their availability or circumstances change.

**Contract Management**
Freelancers can view all their contracts and track their status. When work is complete, the freelancer submits it through the platform for client review. If a disagreement arises regarding scope, quality, or payment, the freelancer can raise a dispute.

**Real-Time Chat**
Within each active contract, freelancers can communicate with clients through a real-time chat channel. Messages are stored with timestamps and read receipts, providing a reliable communication record for project coordination.

**Review Submission**
After a contract is completed, the freelancer can rate the client on a 1-5 star scale and leave an optional comment. This feedback contributes to the client's aggregate rating, helping other freelancers make informed decisions about future engagements.

**Reputation Tracking**
The freelancer's profile displays key reputation metrics including their average rating across all completed contracts, total number of reviews received, and total number of jobs completed. These metrics serve as trust signals for prospective clients evaluating proposals.

## 2.3.3 Administrator Functionality

The Administrator is responsible for platform governance, moderation, and oversight. Admin access is separate from the standard user system, using dedicated credentials configured through environment variables.

**Admin Authentication**
Administrators log in using dedicated credentials (admin email and password) stored in the server's environment configuration. This separation ensures that admin access is not tied to the standard user registration system and can be managed independently.

**Dashboard and Statistics**
The admin dashboard provides a comprehensive overview of platform activity. Key metrics displayed include total registered users broken down by role (client, freelancer), total jobs broken down by status (open, in-progress, completed, cancelled), total contracts by status, total proposals by status, and total reviews submitted.

**User Management**
Administrators can view all registered users with pagination and search capabilities. They can inspect individual user profiles, edit user roles (for example, promoting a user or changing a role assignment), and delete user accounts that violate platform policies or are identified as fraudulent.

**Job Management**
Administrators have visibility into all jobs posted across the platform. They can filter jobs by status and search by keywords. When a job listing contains inappropriate content, violates terms of service, or is identified as spam, the administrator can force-delete it regardless of its current status or associated proposals.

**Contract Management**
Administrators can view all contracts with filtering by status. In exceptional circumstances such as dispute resolution, administrators can override a contract's status to ensure fair outcomes for both parties.

**Review Management**
Administrators can view all reviews submitted on the platform. Reviews that are identified as fraudulent, spam, retaliatory, or in violation of platform guidelines can be removed by the administrator.

**Platform Moderation**
Beyond individual entity management, administrators monitor overall platform health. They can identify patterns of abuse, detect fraudulent accounts, and take corrective action to maintain a safe and productive environment for all users.

## 2.3.4 Shared Platform Services

Beyond role-specific features, the platform provides several cross-cutting services that benefit all users regardless of their role.

**Email Notifications**
The platform sends automated email notifications for key events. A welcome email is sent upon registration. Freelancers receive a notification when their proposal is accepted. Clients receive a notification when a new proposal is submitted for one of their jobs. The email service is powered by Nodemailer, with Mailpit used for local development testing.

**Profile Picture Upload**
All users can upload a profile picture through a secure file upload system built with Multer. Uploads are restricted to image files with a maximum size of 5 megabytes. Profile pictures are stored in the backend's public directory and served as static assets.

**Token Refresh**
The authentication system implements automatic token renewal. Access tokens have a short lifespan of 1 day, while refresh tokens last 10 days. When an access token expires, the client automatically uses the refresh token to obtain a new access token without requiring the user to log in again. This ensures uninterrupted sessions while maintaining security.

**Input Validation**
All API inputs are validated server-side using Zod schemas before processing. This ensures data integrity, prevents malformed requests from causing errors, and provides clear validation error messages to the client for user-facing feedback.

**Pagination**
All list endpoints support paginated responses with configurable page size. This prevents performance degradation as data volumes grow and ensures that clients receive manageable response sizes even when the platform contains thousands of records.

**Error Handling**
A centralized asynchronous error handler wraps all controller functions. This ensures that errors are caught consistently, proper HTTP status codes are returned, and error responses follow a uniform format across the entire API surface.
