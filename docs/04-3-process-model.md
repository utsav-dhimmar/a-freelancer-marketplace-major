# 4.3 Process Model

The Freelancer Marketplace is developed using the **Waterfall Model**, a linear and sequential software development methodology where each phase must be completed before the next phase begins. The model follows a downward flow through distinct stages, resembling a waterfall, hence the name.

## 4.3.1 Phases of the Waterfall Model

The development of the Freelancer Marketplace follows the standard Waterfall lifecycle consisting of the following sequential phases.

**Phase 1: Requirement Analysis**
- All system requirements—both functional and non-functional—are gathered, analyzed, and documented before any design or development work begins.
- Stakeholder expectations are studied through analysis of existing freelance platforms such as Upwork, Fiverr, and Freelancer.com.
- The output of this phase is a complete Software Requirement Specification (SRS) document that serves as a contract between the development team and the stakeholders.

**Phase 2: System Design**
- Based on the requirements document, the system architecture is designed including the Service-Controller-Model pattern for the backend and component-based architecture for the frontend.
- Data models, Entity-Relationship diagrams, Data Flow Diagrams, and Data Dictionaries are created to define how data will be structured, stored, and processed.
- API endpoint specifications, input/output formats, and module interfaces are defined in detail before implementation begins.

**Phase 3: Implementation (Coding)**
- The actual source code is written following the design specifications produced in the previous phase.
- Backend modules (user management, jobs, proposals, contracts, chat, reviews, admin) are developed as per the defined API contracts and data models.
- Frontend pages and components are built according to the interface specifications, consuming the backend APIs.

**Phase 4: Testing and Verification**
- After implementation is complete, the system undergoes comprehensive testing including unit testing, integration testing, system testing, and user acceptance testing.
- Defects discovered during testing are documented, prioritized, and resolved before the system proceeds to deployment.
- Test cases are derived directly from the requirements document to ensure full coverage of specified functionality.

**Phase 5: Deployment and Maintenance**
- The tested system is deployed to the production environment (MongoDB Atlas for database, Render/Vercel for application hosting).
- Post-deployment monitoring ensures the system operates as expected under real-world usage conditions.
- Maintenance activities including bug fixes, performance optimizations, and minor enhancements are carried out as needed.

## 4.3.2 Advantages of Waterfall for This Project

- **Clear Structure:** The sequential nature of the Waterfall model provides a well-defined project structure with clear milestones and deliverables at each phase, making progress easy to track and report.
- **Comprehensive Documentation:** Each phase produces detailed documentation (SRS, design diagrams, test plans) that serves as a reliable reference for future maintenance and enhancement.
- **Simplicity:** The linear flow is straightforward to understand and manage, requiring no complex sprint planning, backlog grooming, or iteration retrospectives.
- **Well-Suited for Academic Projects:** The Waterfall model aligns with the academic project submission format where documentation deliverables (requirement specs, design documents, test reports) are expected at defined intervals.

## 4.3.3 Waterfall Model Diagram

```
+---------------------------+
|   Requirement Analysis    |
+---------------------------+
              |
              v
+---------------------------+
|      System Design        |
+---------------------------+
              |
              v
+---------------------------+
|    Implementation         |
+---------------------------+
              |
              v
+---------------------------+
|   Testing & Verification  |
+---------------------------+
              |
              v
+---------------------------+
| Deployment & Maintenance  |
+---------------------------+
```

Each phase flows strictly into the next. No phase begins until the preceding phase is fully completed and its deliverables are approved. This ensures discipline in the development process and guarantees that each stage has a solid foundation before proceeding.
