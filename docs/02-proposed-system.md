# 2. Proposed System

## 2.1 Project Profile

The **Freelancer Marketplace** is a full-stack, client-server web application designed to provide a comprehensive digital platform where businesses and individuals (Clients) can discover, hire, and collaborate with skilled independent professionals (Freelancers). The system manages the complete lifecycle of a freelance engagement—from initial job posting and talent discovery through proposal evaluation, contract execution, real-time communication, and post-project reviews—within a single, integrated environment.

The platform is branded internally as **FreelanceHub** and is built using modern web technologies that prioritize type safety, real-time interactivity, and scalability. The application follows a Service-Controller-Model architecture on the backend and a component-based Single Page Application (SPA) architecture on the frontend, ensuring a clean separation of concerns and maintainable code across both tiers.

### 2.1.1 Project Identification

| Attribute | Detail |
|---|---|
| **Project Name** | Freelancer Marketplace (FreelanceHub) |
| **Project Type** | Full-Stack Web Application (Academic Major Project) |
| **Architecture** | Client-Server (RESTful API + WebSocket Real-Time Layer) |
| **Frontend** | React.js 19 with TypeScript, Vite 7, Bootstrap 5 |
| **Backend** | Node.js 20+ with Express.js 5, TypeScript |
| **Database** | MongoDB (via Mongoose 9 ODM), MongoDB Atlas (Production) |
| **Real-Time Engine** | Socket.io 4.8 |
| **Authentication** | JSON Web Tokens (JWT) with access/refresh token rotation |
| **Currency** | Indian Rupee (INR / ₹) |
| **Development Model** | Agile / Iterative |

### 2.1.2 Project Scope

The Freelancer Marketplace encompasses the following functional boundaries:

**User Management and Authentication**
The system supports three distinct user roles—Client, Freelancer, and Administrator—each with dedicated access controls and functional capabilities. User registration captures essential identity information including username, full name, email address, and a profile picture uploaded via the platform's file management subsystem. Authentication is handled through a JWT-based token system comprising short-lived access tokens (1-day expiry) and long-lived refresh tokens (10-day expiry), with automatic token refresh logic implemented on the client side. Passwords are secured using bcrypt hashing with a cost factor of 10 salt rounds.

**Job Posting and Discovery**
Clients can create, update, and manage job postings that describe their project requirements. Each job listing includes a title, detailed description, difficulty level (entry, intermediate, or expert), budget type (fixed or hourly), budget amount, and a set of required skills. The platform provides public job browsing with search and filter capabilities by skills, difficulty level, and budget range, enabling freelancers to discover relevant opportunities efficiently.

**Proposal and Bidding System**
Freelancers can submit proposals for open jobs, including a cover letter articulating their qualifications, a proposed bid amount, and an estimated completion timeline. The system enforces a one-proposal-per-freelancer-per-job constraint to maintain bid integrity. Clients can review proposals, shortlist candidates, and accept or reject individual proposals. Upon acceptance, a contract is automatically generated and the associated job transitions to an in-progress state.

**Contract Management**
Contracts formalize the engagement between a client and a freelancer. Each contract records the job reference, both parties, the agreed amount, start date, and current status. The contract lifecycle progresses through defined states: Active (work in progress), Submitted (freelancer has delivered), Completed (client has accepted delivery), and Disputed (either party raises an issue). Completion of a contract increments the freelancer's total jobs counter, contributing to their platform reputation.

**Real-Time Communication**
The platform integrates a Socket.io-based real-time messaging system that provides each active contract with a dedicated chat channel. Both parties can exchange text messages, with all communications persisted to the database for future reference. The system implements read receipts through a readBy array on each message, allowing both parties to track which messages have been seen. Chat access is restricted to contracts in active or submitted status.

**Review and Rating System**
Upon contract completion, both the client and the freelancer can submit a review of the other party. Reviews consist of a numeric rating on a scale of 1 to 5 and an optional text comment of up to 500 characters. The system enforces a one-review-per-user-per-contract constraint to prevent duplicate or spam reviews. Aggregated ratings are maintained on both the freelancer profile (average rating and review count) and the user record (client rating and client review count), providing a transparent trust signal for future engagements.

**Freelancer Profiles**
Freelancers can create and maintain detailed professional profiles that include a professional title, biographical summary, list of skills, hourly rate, and a portfolio of past work samples. Portfolio items consist of a title, external link, and description. The profile also displays the freelancer's aggregate rating, total review count, and number of completed jobs, providing prospective clients with a comprehensive view of the freelancer's experience and reputation.

**Administrative Dashboard**
Administrators have access to a dedicated dashboard that provides platform-wide statistics including user counts by role, job counts by status, contract counts by status, proposal counts by status, and total reviews. The admin panel also provides CRUD capabilities for managing users (view, edit role, delete), jobs (view, filter, force delete), contracts (view, filter, override status), and reviews (view, delete). Admin authentication uses dedicated credentials stored in environment variables rather than the standard user registration system.

**Email Notifications**
The platform integrates Nodemailer for transactional email delivery. Three types of automated emails are implemented: a welcome email sent upon user registration, a notification email sent to freelancers when their proposal is accepted, and a notification email sent to clients when a new proposal is received for their job. For local development, the email service uses Mailpit (a local SMTP testing tool) configured via Docker Compose.

### 2.1.3 System Boundaries

The Freelancer Marketplace operates within the following defined boundaries:

**In Scope:**
- User registration, authentication, and profile management for all three roles.
- Job creation, browsing, searching, filtering, updating, and deletion.
- Proposal submission, review, acceptance, rejection, and withdrawal.
- Contract creation, work submission, completion, and dispute initiation.
- Real-time text-based messaging within active contracts.
- Post-contract review and rating submission.
- Freelancer profile creation with portfolio management.
- Administrative oversight and management of all platform entities.
- Email notifications for key platform events.
- Profile picture upload and storage.

**Out of Scope (Current Version):**
- Payment processing and escrow management (contracts track amounts but do not process transactions).
- Video or voice conferencing.
- File sharing or version control for project deliverables.
- Advanced project management features (task boards, Gantt charts, time tracking).
- Mobile native applications (the platform is a responsive web application).
- AI-driven talent matching or recommendation engine.
- Multi-language localization.
- Two-factor authentication (2FA).

### 2.1.4 Technology Summary

The technology stack is selected to balance developer productivity, type safety, runtime performance, and ecosystem maturity.

**Backend Stack:**

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v20+ | JavaScript runtime environment |
| Express.js | 5.2.1 | HTTP server and REST API framework |
| TypeScript | 5.9.3 | Static type checking for JavaScript |
| Mongoose | 9.x | MongoDB Object Document Mapper (ODM) |
| Socket.io | 4.8.3 | Real-time bidirectional event-based communication |
| jsonwebtoken | 9.0.3 | JWT creation and verification |
| bcrypt | 6.0.0 | Password hashing |
| Multer | 2.0.2 | Multipart form data handling (file uploads) |
| Nodemailer | 8.0.1 | Email sending |
| Zod | 4.3.6 | Schema validation |
| tsx | 4.21.0 | TypeScript execution without compilation |

**Frontend Stack:**

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | Component-based UI library |
| TypeScript | 5.9.3 | Static type checking |
| Vite | 7.3.1 | Build tool and development server |
| React Router DOM | 7.13.1 | Client-side routing |
| Bootstrap | 5.3.8 | CSS framework for responsive design |
| Axios | 1.13.5 | HTTP client for API communication |
| React Hook Form | 7.71.2 | Form state management |
| Zod | 4.3.6 | Client-side schema validation |
| Socket.io Client | 4.8.3 | Real-time communication client |
| React Icons | 5.5.0 | Icon component library |

**Infrastructure and DevOps:**

| Tool | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted MongoDB database (production) |
| Docker Compose | Local service orchestration (Mailpit for email testing) |
| Husky | Git hooks for pre-commit code quality enforcement |
| lint-staged | Run linters on staged files only |
| oxfmt | Code formatting |

### 2.1.5 User Roles and Capabilities

The platform implements a Role-Based Access Control (RBAC) model with three distinct roles, each mapped to specific functional capabilities and UI experiences.

**Client:**
- Register and manage personal profile with profile picture.
- Post new job listings with detailed requirements.
- View and manage their posted jobs (update status, delete).
- Review proposals submitted by freelancers for their jobs.
- Accept or reject proposals, triggering contract creation upon acceptance.
- View and manage active contracts.
- Mark submitted work as complete or raise disputes.
- Communicate with hired freelancers via the contract chat system.
- Submit reviews for freelancers upon contract completion.

**Freelancer:**
- Register and manage personal profile including professional title, bio, skills, hourly rate, and portfolio.
- Browse and search available job listings.
- Submit proposals for open jobs with cover letter, bid amount, and estimated time.
- Withdraw pending proposals.
- View and manage their submitted proposals.
- View and manage active contracts.
- Submit completed work for client review.
- Raise disputes if disagreements arise.
- Communicate with clients via the contract chat system.
- Submit reviews for clients upon contract completion.

**Administrator:**
- Access a dedicated admin dashboard with platform-wide statistics.
- View, edit, and delete user accounts.
- View all jobs across the platform with filtering and search capabilities.
- Force-delete jobs that violate platform policies.
- View all contracts with filtering by status.
- Override contract status in exceptional circumstances.
- View all reviews and delete reviews that violate platform policies.
- Monitor overall platform health and activity metrics.

### 2.1.6 Data Model Overview

The platform's data model consists of seven interconnected MongoDB collections:

1. **Users** — Stores authentication credentials, identity information, role assignment, and aggregate client ratings.
2. **Jobs** — Represents job postings with requirements, budget, difficulty, and lifecycle status.
3. **Proposals** — Captures freelancer applications for jobs, including bid details and acceptance status.
4. **Contracts** — Formalizes accepted engagements with amount, parties, and completion tracking.
5. **Freelancers** — Extended profile data for freelancer users, including skills, portfolio, and professional metrics.
6. **Reviews** — Stores post-contract ratings and comments with referential integrity constraints.
7. **Messages** — Persists real-time chat messages with read-receipt tracking.

Each collection is defined as a Mongoose schema with appropriate validation rules, default values, indexes for query optimization, and reference relationships to maintain data integrity across the system. The relationships between these collections form a coherent data model that supports the full lifecycle of a freelance engagement, from initial user registration through job posting, proposal submission, contract execution, and post-project review.
