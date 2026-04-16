# 5. System Requirement Specification

## 5.1 System Requirements

The system requirements for the Freelancer Marketplace define the functional capabilities, performance expectations, security standards, and interface specifications that the platform must satisfy. These requirements are categorized to provide a clear and structured understanding of what the system must deliver.

### 5.1.1 Functional Requirements

Functional requirements describe what the system must do—the specific behaviors, operations, and features that the platform must provide to its users.

**User Registration and Authentication**
- The system shall allow new users to register by providing a username, full name, email address, and password.
- The system shall allow users to upload an optional profile picture during or after registration.
- The system shall hash all passwords using bcrypt before storing them in the database.
- The system shall authenticate users by issuing a JWT access token (valid for 1 day) and a refresh token (valid for 10 days) upon successful login.
- The system shall automatically refresh expired access tokens using the refresh token without requiring the user to log in again.
- The system shall enforce role-based access control, restricting features based on the user's assigned role (Client, Freelancer, or Admin).

**Job Management**
- The system shall allow clients to create job postings with a title (10-100 characters), description, difficulty level, budget type (fixed/hourly), budget amount, and required skill tags.
- The system shall allow all visitors (authenticated and unauthenticated) to browse and search open job listings.
- The system shall support filtering jobs by skills, difficulty level, and budget range.
- The system shall allow clients to update and delete only their own job postings.
- The system shall automatically change the job status to in-progress when a proposal is accepted.

**Proposal Management**
- The system shall allow freelancers to submit proposals for open jobs with a cover letter (minimum 20 characters), bid amount, and estimated completion time.
- The system shall enforce a constraint allowing only one proposal per freelancer per job.
- The system shall allow clients to accept, reject, or shortlist proposals received for their jobs.
- The system shall automatically create a contract and update the job status when a proposal is accepted.
- The system shall allow freelancers to withdraw proposals that are still in pending status.

**Contract Management**
- The system shall track contracts through four states: active, submitted, completed, and disputed.
- The system shall allow freelancers to submit completed work for client review on active contracts.
- The system shall allow clients to mark submitted work as completed or raise a dispute.
- The system shall allow either party to raise a dispute on an active or submitted contract.
- The system shall increment the freelancer's total jobs counter upon contract completion.

**Real-Time Chat**
- The system shall provide a dedicated chat channel for each contract in active or submitted status.
- The system shall deliver messages in real time using WebSocket connections via Socket.io.
- The system shall persist all chat messages in the database with sender information and timestamps.
- The system shall track which users have read each message using a readBy array.
- The system shall prevent chat access for contracts in completed or disputed status.

**Review and Rating**
- The system shall allow clients and freelancers to submit reviews after contract completion.
- Each review shall include a numeric rating (1 to 5) and an optional text comment (maximum 500 characters).
- The system shall enforce one review per user per contract.
- The system shall update the freelancer's aggregate rating and review count when a review is submitted.
- The system shall update the client's aggregate rating when a review is submitted by a freelancer.

**Freelancer Profile**
- The system shall allow freelancers to create a professional profile with a title, bio (maximum 2000 characters), skills list, and hourly rate.
- The system shall allow freelancers to add and remove portfolio items, each containing a title, external link, and description.
- The system shall display the freelancer's average rating, total reviews, and total completed jobs on their public profile.

**Admin Dashboard**
- The system shall provide administrators with a dashboard displaying platform statistics including user counts by role, job counts by status, contract counts by status, proposal counts by status, and total reviews.
- The system shall allow administrators to view, edit, and delete user accounts.
- The system shall allow administrators to view and force-delete any job on the platform.
- The system shall allow administrators to view all contracts and override their status when necessary.
- The system shall allow administrators to view and delete any review on the platform.

**Email Notifications**
- The system shall send a welcome email to users upon successful registration.
- The system shall send a notification email to freelancers when their proposal is accepted.
- The system shall send a notification email to clients when a new proposal is received for their job.

### 5.1.2 Non-Functional Requirements

Non-functional requirements define the quality attributes, constraints, and performance criteria that the system must satisfy beyond its functional capabilities.

**Performance**
- All API endpoints shall respond within 500 milliseconds under normal load conditions.
- All frontend pages shall load within 3 seconds on a standard broadband connection (10 Mbps).
- The system shall support concurrent usage by multiple users without degradation in response time.
- Database queries shall use appropriate indexes to ensure efficient execution as data volumes grow.

**Security**
- All passwords shall be hashed using bcrypt with a minimum cost factor of 10 salt rounds.
- All authenticated API endpoints shall verify JWT token validity and reject expired or tampered tokens.
- File uploads shall be restricted to image file types (PNG, JPG, JPEG, GIF) with a maximum size of 5 megabytes.
- The system shall validate all incoming API request data using Zod schemas before processing.
- Admin credentials shall be stored in environment variables, separate from the user database.

**Scalability**
- All list endpoints shall support pagination with configurable page size to prevent performance issues with large datasets.
- The backend architecture shall follow a layered Service-Controller-Model pattern, allowing individual layers to be scaled or replaced independently.
- The database schema shall use appropriate indexes on frequently queried fields (email, username, job status, contract status).

**Usability**
- The user interface shall be responsive and functional across desktop (1920x1080), tablet (768x1024), and mobile (375x667) screen sizes.
- Form validation errors shall provide clear, field-specific error messages indicating what needs to be corrected.
- The navigation structure shall be consistent across all pages, with role-appropriate menu items.
- Loading states shall be indicated with spinners or skeleton screens during data fetch operations.

**Reliability**
- The system shall handle all errors gracefully, returning appropriate HTTP status codes and consistent error response formats.
- The Socket.io connection shall automatically attempt reconnection after temporary network disconnections.
- The system shall not crash or lose data due to invalid user input; all inputs shall be validated before processing.

### 5.1.3 Interface Requirements

**User Interface**
- The frontend shall be a Single Page Application (SPA) built with React, providing smooth navigation without full page reloads.
- The interface shall use Bootstrap 5 for consistent styling, responsive layout, and pre-built UI components.
- All forms shall provide real-time validation feedback using React Hook Form and Zod schemas.

**Hardware Interface**
- The system shall operate on standard hardware without requiring any specialized devices or peripherals.
- Client-side access requires only a modern web browser and an internet connection.

**Software Interface**
- The backend shall communicate with the frontend through a RESTful API over HTTPS.
- The backend shall connect to MongoDB Atlas using the Mongoose ODM for all database operations.
- The real-time communication layer shall use Socket.io over WebSocket protocol with HTTP fallback.
- The email service shall connect to an SMTP server (Mailpit for development, configurable SMTP for production) via Nodemailer.

**Communication Interface**
- All API communication shall follow the HTTP/HTTPS protocol with JSON as the data interchange format.
- Real-time communication shall use the WebSocket protocol with Socket.io event-based messaging.
- Email notifications shall be delivered via SMTP protocol.
