# Database Schema Documentation

MongoDB/Mongoose schemas for a freelancer marketplace platform.

---

## Collections

### 1. User

Central user account entity. Supports three roles: `client`, `freelancer`, `admin`.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `username` | String | Yes | unique, trim, 3–30 chars | Yes |
| `fullname` | String | Yes | trim, max 100 chars | Yes |
| `email` | String | Yes | unique, trim, lowercase | Yes |
| `password` | String | Yes | min 6 chars (bcrypt hashed) | No |
| `refreshToken` | String | No | default: null | No |
| `role` | String | No | enum: `client`, `admin`, `freelancer`; default: `client` | No |
| `profilePicture` | String | No | default: null | Yes |
| `clientRating` | Number | No | 0–5, default: 0 | No |
| `clientReviewCount` | Number | No | min 0, default: 0 | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

**Methods:** `comparePassword(candidate)` — compares bcrypt hash.

---

### 2. Freelancer

Freelancer profile, linked 1:1 to a User.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `user` | ObjectId → User | Yes | unique | Yes |
| `title` | String | Yes | trim, max 100 chars | Yes |
| `bio` | String | No | trim, max 2000 chars | No |
| `skills` | [String] | No | default: [] | Yes |
| `hourlyRate` | Number | Yes | min 0 | No |
| `portfolio` | [PortfolioItem] | No | default: [] | No |
| `rating` | Number | No | 0–5, default: 0 | No |
| `reviewCount` | Number | No | min 0, default: 0 | No |
| `totalJobs` | Number | No | min 0, default: 0 | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

**Embedded Subdocument — PortfolioItem** (`_id: false`):

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | String | Yes | trim, max 100 chars |
| `link` | String | Yes | trim |
| `desc` | String | No | trim, max 500 chars |

---

### 3. Job

A job posting created by a client.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `client` | ObjectId → User | Yes | — | Yes |
| `title` | String | Yes | trim, 10–100 chars | No |
| `description` | String | Yes | — | No |
| `difficulty` | String | Yes | enum: `entry`, `intermediate`, `expert` | No |
| `budget` | Number | Yes | min 0 | No |
| `budgetType` | String | Yes | enum: `fixed`, `hourly` | No |
| `skillsRequired` | [String] | No | default: [] | Yes |
| `status` | String | No | enum: `open`, `in_progress`, `completed`, `cancelled`; default: `open` | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

---

### 4. Proposal

A freelancer's bid/proposal on a Job. Unique constraint: one proposal per freelancer per job.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `job` | ObjectId → Job | Yes | — | Yes |
| `freelancer` | ObjectId → User | Yes | — | Yes |
| `coverLetter` | String | Yes | trim, min 20 chars | No |
| `bidAmount` | Number | Yes | min 0 | No |
| `estimatedTime` | String | Yes | trim | No |
| `status` | String | No | enum: `pending`, `shortlisted`, `accepted`, `rejected`; default: `pending` | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

**Compound Index:** `{ job: 1, freelancer: 1 }` — unique.

---

### 5. Contract

Created when a proposal is accepted. Links a Job, its client, and the hired freelancer.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `job` | ObjectId → Job | Yes | — | Yes |
| `client` | ObjectId → User | Yes | — | Yes |
| `freelancer` | ObjectId → User | Yes | — | Yes |
| `proposal` | ObjectId → Proposal | Yes | — | No |
| `amount` | Number | Yes | min 0 | No |
| `status` | String | No | enum: `active`, `submitted`, `completed`, `disputed`; default: `active` | No |
| `startDate` | Date | Yes | default: now | No |
| `endDate` | Date | No | — | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

---

### 6. Message

Chat messages within a contract context.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `contractId` | ObjectId → Contract | Yes | — | Yes |
| `senderId` | ObjectId → User | Yes | — | No |
| `senderName` | String | Yes | — | No |
| `message` | String | Yes | — | No |
| `readBy` | [ObjectId → User] | No | default: [] | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

**Compound Index:** `{ contractId: 1, createdAt: -1 }`.

---

### 7. Review

A review left after a contract completes. Unique constraint: one review per reviewer+reviewee+contract.

| Field | Type | Required | Constraints | Indexed |
|---|---|---|---|---|
| `reviewer` | ObjectId → User | Yes | — | No |
| `reviewee` | ObjectId → User | Yes | — | No |
| `contract` | ObjectId → Contract | Yes | — | No |
| `targetRole` | String | Yes | enum: `client`, `freelancer` | No |
| `rating` | Number | Yes | 1–5 | No |
| `comment` | String | No | trim, max 500 chars | No |
| `createdAt` | Date | Auto | via `timestamps` | No |
| `updatedAt` | Date | Auto | via `timestamps` | No |

**Compound Index:** `{ reviewer: 1, reviewee: 1, contract: 1 }` — unique.

---

## Relationships

```
User ────────────────────────────────────────────────────────────┐
  │                                                              │
  ├── 1:1 ──→ Freelancer (via freelancer.user)                   │
  │                                                              │
  ├── 1:N ──→ Job (via job.client)                               │
  │                                                              │
  ├── 1:N ──→ Proposal (via proposal.freelancer)                 │
  │                                                              │
  ├── 1:N ──→ Contract.asClient (via contract.client)            │
  ├── 1:N ──→ Contract.asFreelancer (via contract.freelancer)    │
  │                                                              │
  ├── 1:N ──→ Message (via message.senderId)                     │
  ├── N:N ──→ Message.readBy (via message.readBy[])              │
  │                                                              │
  ├── 1:N ──→ Review.asReviewer (via review.reviewer)            │
  └── 1:N ──→ Review.asReviewee (via review.reviewee)            │
                                                                      │
Job ──────────────────────────────────────────────────────────────┐
  │                                                               │
  ├── 1:N ──→ Proposal (via proposal.job)                        │
  │                                                               │
  └── 1:N ──→ Contract (via contract.job)                        │

Proposal ─────────────────────────────────────────────────────────┐
  │                                                               │
  └── 1:1 ──→ Contract (via contract.proposal)                   │

Contract ─────────────────────────────────────────────────────────┐
  │                                                               │
  ├── 1:N ──→ Message (via message.contractId)                   │
  │                                                               │
  └── 1:N ──→ Review (via review.contract)                       │
```

### Summary of References

| Source | Field | Target | Cardinality |
|---|---|---|---|
| Freelancer | `user` | User | 1:1 (unique) |
| Job | `client` | User | N:1 |
| Proposal | `job` | Job | N:1 |
| Proposal | `freelancer` | User | N:1 |
| Proposal | `job + freelancer` | — | unique compound |
| Contract | `job` | Job | N:1 |
| Contract | `client` | User | N:1 |
| Contract | `freelancer` | User | N:1 |
| Contract | `proposal` | Proposal | 1:1 |
| Message | `contractId` | Contract | N:1 |
| Message | `senderId` | User | N:1 |
| Message | `readBy[]` | User | N:N |
| Review | `reviewer` | User | N:1 |
| Review | `reviewee` | User | N:1 |
| Review | `contract` | Contract | N:1 |
| Review | `reviewer + reviewee + contract` | — | unique compound |
