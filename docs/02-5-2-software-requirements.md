# 2.5.2 Software Requirements

The following software tools, runtimes, and frameworks are required to develop, deploy, and access the Freelancer Marketplace platform.

**Operating System**

- Windows 10 or Windows 11
- macOS Monterey (12.0) or later
- Ubuntu 20.04 LTS or any Linux distribution with equivalent package support

**Runtime and Languages**

- Node.js v20.x (LTS) or higher as the JavaScript runtime environment
- TypeScript 5.9.x for static type checking across both frontend and backend
- npm or pnpm as the package manager for dependency installation

**Database**

- MongoDB Atlas (cloud-hosted) for production environment
- MongoDB Community Server for local development
- Mongoose 9.x as the Object Document Mapper (ODM) for schema definition and query building
- MongoDB Compass for local database visualization and debugging

**Frontend Frameworks and Libraries**

- React 19.x for building the component-based user interface
- Vite 7.x as the build tool and development server with hot module replacement
- React Router DOM 7.x for client-side routing and navigation
- Bootstrap 5.x for responsive CSS styling and UI components
- Axios for HTTP client communication with the backend API
- React Hook Form for efficient form state management
- Zod for client-side schema validation
- Socket.io Client for real-time communication with the backend

**Backend Frameworks and Libraries**

- Express.js 5.x as the HTTP server and REST API framework
- Socket.io 4.x for WebSocket-based real-time event communication
- jsonwebtoken for JWT token creation and verification
- bcrypt for password hashing with salt rounds
- Multer for handling multipart form data and file uploads
- Nodemailer for sending transactional email notifications
- Zod for server-side input validation

**Development Tools**

- Visual Studio Code as the primary code editor with ESLint and TypeScript extensions
- Postman or Insomnia for API endpoint testing and debugging
- Git for version control and collaborative development
- Husky for Git hooks to enforce code quality checks before commits
- Docker Desktop for running Mailpit (local SMTP testing service)

**Browser Compatibility**

- Google Chrome (latest 2 versions)
- Mozilla Firefox (latest 2 versions)
- Microsoft Edge (latest 2 versions)
- Safari (latest 2 versions)
