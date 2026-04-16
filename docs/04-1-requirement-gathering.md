# 4. System Planning

## 4.1 Requirement Gathering

Requirement gathering is the process of identifying, documenting, and analyzing the needs and expectations of all stakeholders for the Freelancer Marketplace platform. The requirements were collected through a combination of studying existing freelance platforms, analyzing user pain points, and defining the functional scope of the system.

### Functional Requirements

**User Management**
- The system shall allow users to register with a username, full name, email, password, and optional profile picture.
- The system shall support three user roles: Client, Freelancer, and Administrator.
- The system shall authenticate users using JWT-based access and refresh tokens.
- The system shall allow users to update their profile information and upload a profile picture.

**Job Management**
- The system shall allow clients to create job postings with title, description, difficulty level, budget, budget type, and required skills.
- The system shall allow all visitors to browse and search open jobs with filters for skills, difficulty, and budget.
- The system shall allow clients to update, close, or delete their own job postings.

**Proposal Management**
- The system shall allow freelancers to submit proposals with a cover letter, bid amount, and estimated time.
- The system shall enforce one proposal per freelancer per job.
- The system shall allow clients to accept, reject, or shortlist proposals.
- The system shall automatically create a contract when a proposal is accepted.

**Contract Management**
- The system shall track contracts through states: active, submitted, completed, and disputed.
- The system shall allow freelancers to submit completed work for client review.
- The system shall allow either party to raise a dispute on an active contract.

**Real-Time Communication**
- The system shall provide a chat channel for each active contract.
- The system shall persist all messages with timestamps and read receipts.
- The system shall deliver messages in real time using WebSocket connections.

**Review System**
- The system shall allow both parties to rate each other on a 1-5 scale after contract completion.
- The system shall enforce one review per user per contract.
- The system shall update aggregate ratings on freelancer profiles and user records.

**Admin Management**
- The system shall provide administrators with a dashboard showing platform-wide statistics.
- The system shall allow admins to manage users, jobs, contracts, and reviews with CRUD operations.

### Non-Functional Requirements

**Performance**
- The system shall load any page within 3 seconds on a standard broadband connection.
- The API shall respond to requests within 500 milliseconds under normal load.

**Security**
- All passwords shall be hashed using bcrypt before storage.
- All authenticated API endpoints shall verify JWT tokens before processing.
- File uploads shall be restricted to image types with a 5MB size limit.

**Scalability**
- The database shall support pagination on all list endpoints to handle growing data volumes.
- The backend architecture shall follow a layered pattern to allow independent scaling of components.

**Usability**
- The interface shall be responsive and functional on desktop, tablet, and mobile devices.
- Form validation errors shall provide clear, user-friendly messages indicating which fields need correction.

**Reliability**
- The system shall handle errors gracefully with consistent HTTP status codes and error response formats.
- The Socket.io connection shall automatically reconnect after temporary network disconnections.
