# Unutilized and Underutilized Backend APIs

This document outlines the backend API endpoints that are either currently unused by the frontend or are being used incorrectly (mismatched functionality).

## 1. Dedicated Search Endpoints
The frontend currently uses generic `getAll` methods for jobs and freelancers, but the backend provides dedicated search endpoints with much richer filtering capabilities.

### `GET /api/jobs/search`
- **Why**: The current `jobApi.getAll` only supports basic pagination and status. This search endpoint allows filtering by multiple criteria simultaneously.
- **How to Use**:
  - Replace or augment `jobApi.getAll` to call `/api/jobs/search`.
  - **Query Parameters**:
    - `skills`: Comma-separated list (e.g., `react,nodejs`).
    - `difficulty`: `entry`, `intermediate`, or `expert`.
    - `budgetType`: `fixed` or `hourly`.
    - `minBudget` / `maxBudget`: Numeric values.
    - `status`: `open`, `in_progress`, `completed`, or `cancelled`.

### `GET /api/freelancers/search`
- **Why**: The backend's `getAllFreelancers` does not support skill filtering. Only this endpoint handles skill-based discovery.
- **How to Use**:
  - Update `freelancerApi.getAll` to hit `/api/freelancers/search` when skills are provided.
  - **Query Parameters**:
    - `skills`: Comma-separated string of skills.

---

## 2. Advanced Management APIs
These endpoints provide more granular control but are not yet implemented in the UI.

### `GET /api/proposals/:id`
- **Why**: Allows fetching full details of a single proposal, including the associated job and client information. Useful for "Proposal Detail" views.
- **How to Use**:
  - Add `getById(id: string)` to `proposalApi`.
  - Use it when a freelancer clicks on a specific proposal from their "My Proposals" list to see its status and details.

### `PATCH /api/jobs/:id/status`
- **Why**: Allows manual status updates for jobs (e.g., cancelling a job).
- **How to Use**:
  - Add `updateStatus(id: string, status: string)` to `jobApi`.
  - Provide a "Cancel Job" button for clients on their dashboard.

### `DELETE /api/freelancers`
- **Why**: Allows a user to retire their freelancer profile without deleting their entire account.
- **How to Use**:
  - Add `deleteProfile()` to `freelancerApi`.
  - Add a "Deactivate Freelancer Profile" option in the user settings.

---

## 3. Mismatched / Missing Endpoints (Bugs)
These are cases where the frontend expects an endpoint that doesn't exist, or the backend logic is more semantic.

### `PUT /api/freelancers/portfolio/:index` (MISSING IN BACKEND)
- **Problem**: The frontend `freelancerApi.updatePortfolioItem` attempts to call this, but the route is not defined in `freelancer.routes.ts`.
- **Fix**: The backend should implement this route to allow editing existing portfolio items without deleting and re-adding them.

### `PATCH /api/contracts/:id/status`
- **Why**: A generic status updater.
- **How to Use**: The frontend currently uses specific semantic endpoints like `/submit`, `/complete`, and `/dispute`. While these are better, the generic status endpoint can be used for administrative overrides or other status transitions not covered by semantic actions.

---

## 4. Admin Specifics
The `adminApi` is mostly complete, but could benefit from:
- `GET /api/admin/users/:id`: Currently implemented in API but could be better utilized in the UI for a detailed "User Audit" view.
- `PATCH /api/admin/contracts/:id/status`: Powerful override for administrators to resolve stuck contracts.
