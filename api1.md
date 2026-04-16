# Unused Backend APIs - Frontend Integration Analysis

This document analyzes backend APIs that are not being utilized by the frontend, explains why they should be used, and provides recommendations for integration.

---

## 1. Jobs API - Search Endpoint

### Backend API
```
GET /api/jobs/search
```

### Status
**Not utilized in frontend**

### Why it should be used
- Users need to search for jobs based on keywords, skills, or other filters
- The current `getAll` endpoint only fetches paginated jobs without search functionality
- Search is essential for job discovery on a marketplace platform

### How to implement
```typescript
// Add to jobApi in frontend/src/api/index.ts
search: async (params: { search?: string; skills?: string; status?: string }) => {
  const response = await api.get<ApiResponse<{ jobs: IJob[]; total: number }>>(
    '/jobs/search',
    { params }
  );
  return response.data.data;
}
```

### Usage in frontend
- Job search bar component
- Advanced job filters page
- Homepage job discovery

---

## 2. Freelancers API - Search Endpoint

### Backend API
```
GET /api/freelancers/search
```

### Status
**Not utilized in frontend**

### Why it should be used
- Clients need to find freelancers based on skills, expertise, or name
- Currently only `getAll` is available which doesn't support skill-based filtering
- Essential for freelancer discovery on the platform

### How to implement
```typescript
// Add to freelancerApi in frontend/src/api/index.ts
search: async (params: { search?: string; skills?: string }) => {
  const response = await api.get<
    ApiResponse<{ freelancers: IFreelancer[]; total: number }>
  >('/freelancers/search', { params });
  return response.data.data;
}
```

### Usage in frontend
- Freelancer search page
- Skill-based freelancer filtering
- "Find Freelancers" feature

---

## 3. Freelancers API - Delete Endpoint

### Backend API
```
DELETE /api/freelancers
```

### Status
**Not utilized in frontend**

### Why it should be used
- Freelancers may want to delete their profile entirely
- Required for account deletion workflows
- GDPR compliance - users can request complete data removal

### How to implement
```typescript
// Add to freelancerApi in frontend/src/api/index.ts
delete: async () => {
  await api.delete('/freelancers');
}
```

### Usage in frontend
- Settings page - "Delete Account" option
- Freelancer profile management
- Account deactivation flow

---

## 4. Proposals API - Get Proposal by ID

### Backend API
```
GET /api/proposals/:id
```

### Status
**Not utilized in frontend**

### Why it should be used
- View detailed proposal information
- Needed when accessing a proposal directly (e.g., from notifications)
- Required for proposal comparison view

### How to implement
```typescript
// Add to proposalApi in frontend/src/api/index.ts
getById: async (id: string) => {
  const response = await api.get<ApiResponse<{ proposal: IProposal }>>(
    `/proposals/${id}`
  );
  return response.data.data.proposal;
}
```

### Usage in frontend
- Proposal detail modal/page
- Notification click handling
- Proposal comparison feature

---

## 5. Contracts API - Update Status Endpoint

### Backend API
```
PATCH /api/contracts/:id/status
```

### Status
**Not utilized in frontend**

### Why it should be used
- Manual status override if needed
- Admin-level contract management
- Emergency status changes

### How to implement
```typescript
// Add to contractApi in frontend/src/api/index.ts
updateStatus: async (id: string, status: string) => {
  const response = await api.patch<ApiResponse<{ contract: IContract }>>(
    `/contracts/${id}/status`,
    { status }
  );
  return response.data.data.contract;
}
```

### Usage in frontend
- Contract management panel
- Contract status override (admin only)

---

## 6. Freelancers API - Remove Portfolio Item

### Backend API
```
DELETE /api/freelancers/portfolio/:index
```

### Status
**Partially implemented in frontend (via deletePortfolioItem)** - Already exists but not fully connected

### Why it should be used
- Freelancers need to manage their portfolio
- Remove outdated or unwanted portfolio items

### Current implementation
Already exists in `frontend/src/api/index.ts:288-293` but may need verification.

---

## Summary Table

| API Endpoint | Method | Frontend Status | Priority |
|--------------|--------|-----------------|----------|
| /jobs/search | GET | Not implemented | High |
| /freelancers/search | GET | Not implemented | High |
| /freelancers | DELETE | Not implemented | Medium |
| /proposals/:id | GET | Not implemented | Medium |
| /contracts/:id/status | PATCH | Not implemented | Low |
| /freelancers/portfolio/:index | DELETE | Implemented | Low |

---

## Recommendations

### High Priority
1. **Job Search** - Essential for job discovery
2. **Freelancer Search** - Essential for freelancer discovery

### Medium Priority
3. **Delete Freelancer Profile** - Account management
4. **Get Proposal by ID** - Detailed proposal views

### Low Priority
5. **Contract Status Update** - Administrative feature
6. **Portfolio Item Removal** - Already partially implemented