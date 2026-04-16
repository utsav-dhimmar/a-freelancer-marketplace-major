# 5.2 Module Specification

The Freelancer Marketplace is divided into seven functional modules, each responsible for a specific domain of the platform's operations.

## 5.2.1 User Module

- **Registration:** Allows new users to create an account by providing username, full name, email, password, and optional profile picture.
- **Authentication:** Validates user credentials and issues JWT access tokens and refresh tokens for secure session management.
- **Password Security:** Hashes all passwords using bcrypt with 10 salt rounds before storing in the database to ensure credential safety.
- **Profile Management:** Enables users to update personal information, change profile picture, and manage account details.
- **Token Refresh:** Automatically renews expired access tokens using refresh tokens without requiring users to log in again.
- **Role Assignment:** Assigns each user a role (Client, Freelancer, or Admin) that determines their access level and available features.

## 5.2.2 Job Module

- **Job Creation:** Allows clients to post job listings with title, description, difficulty level, budget type, budget amount, and required skills.
- **Job Discovery:** Enables all users to browse open job listings with search and filter capabilities by skills, difficulty, and budget range.
- **Job Modification:** Allows clients to update or delete their own job postings while preventing unauthorized changes by other users.
- **Status Tracking:** Manages job lifecycle through statuses—open, in_progress, completed, and cancelled—with automated transitions on proposal acceptance.
- **Pagination:** Returns paginated job listings to ensure efficient data loading as the number of available jobs grows.

## 5.2.3 Proposal Module

- **Proposal Submission:** Allows freelancers to submit proposals for open jobs with a cover letter, bid amount, and estimated completion time.
- **Uniqueness Enforcement:** Restricts each freelancer to one proposal per job, preventing duplicate or spam submissions.
- **Proposal Review:** Enables clients to view all proposals for their jobs and evaluate them based on cover letter, bid, and freelancer profile.
- **Decision Handling:** Processes client decisions to accept, reject, or shortlist proposals with appropriate status updates and side effects.
- **Contract Creation:** Automatically generates a contract document and updates the job status to in_progress when a proposal is accepted.
- **Withdrawal:** Allows freelancers to withdraw proposals that are still in pending status if their availability changes.

## 5.2.4 Contract Module

- **Contract Creation:** Automatically generates a contract linking the client, freelancer, job, and accepted proposal with the agreed amount.
- **Work Submission:** Allows freelancers to submit completed work for client review, transitioning the contract from active to submitted status.
- **Completion Handling:** Enables clients to review submitted work and mark the contract as completed, finalizing the engagement.
- **Dispute Resolution:** Allows either party to raise a dispute on an active or submitted contract when disagreements arise.
- **Reputation Update:** Increments the freelancer's total completed jobs counter upon successful contract completion.
- **Access Control:** Restricts contract visibility to only the client and freelancer who are parties to the engagement.

## 5.2.5 Chat Module

- **Real-Time Messaging:** Delivers messages instantly between client and freelancer within active contracts using Socket.io WebSocket connections.
- **Message Persistence:** Stores all chat messages in the database with sender information, timestamps, and contract reference for future retrieval.
- **Read Receipts:** Tracks which users have read each message through a readBy array and broadcasts read status to the other party in real time.
- **Chat Rooms:** Organizes connections into contract-specific rooms so that messages are delivered only to the parties of that contract.
- **Message History:** Provides paginated access to previous messages via a REST API endpoint, sorted by newest first.
- **Access Restriction:** Limits chat availability to contracts in active or submitted status only.

## 5.2.6 Review Module

- **Review Submission:** Allows both clients and freelancers to rate each other on a 1-5 star scale with an optional text comment after contract completion.
- **Uniqueness Enforcement:** Ensures one review per user per contract through a database unique index on reviewer, reviewee, and contract.
- **Rating Aggregation:** Automatically recalculates the reviewee's average rating and review count whenever a new review is submitted.
- **Contract Verification:** Validates that the associated contract is in completed status before allowing a review to be submitted.
- **Review Querying:** Provides endpoints to fetch all reviews for a specific user or a specific contract for transparency.
- **Existence Check:** Allows the frontend to verify whether the current user has already reviewed a specific contract before showing the review form.

## 5.2.7 Admin Module

- **Secure Login:** Authenticates administrators using dedicated credentials stored in environment variables, separate from the user registration system.
- **Dashboard Statistics:** Provides a centralized overview of platform metrics including total users by role, jobs by status, contracts by status, proposals by status, and total reviews.
- **User Management:** Allows administrators to view all registered users, search and filter by role, edit user roles, and delete accounts that violate platform policies.
- **Job Moderation:** Enables administrators to browse all jobs on the platform, filter by status, search by keywords, and force-delete listings containing inappropriate content.
- **Contract Oversight:** Provides visibility into all contracts with filtering by status and the ability to override contract status in exceptional circumstances.
- **Review Moderation:** Allows administrators to view all reviews and delete those identified as fraudulent, spam, or retaliatory.
