# Contributing to Freelancer Marketplace

First off, thank you for considering contributing to the Freelancer Marketplace project! It's people like you who make this tool better for everyone.

## Table of Contents

- [Contributing to Freelancer Marketplace](#contributing-to-freelancer-marketplace)
  - [Table of Contents](#table-of-contents)
  - [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Pull Requests](#pull-requests)
  - [Local Development Setup](#local-development-setup)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup (React)](#frontend-setup-react)
  - [Coding Standards](#coding-standards)
    - [Style Guide](#style-guide)
    - [Branch Naming](#branch-naming)
    - [Commit Messages](#commit-messages)
  - [Project Structure](#project-structure)

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:

- A clear and descriptive title.
- Steps to reproduce the bug.
- Expected behaviour vs. actual behaviour.
- Screenshots if applicable.
- Environment details (OS, Browser, Node version).

### Suggesting Enhancements

We welcome ideas for new features or improvements! Please open an issue and:

- Use a descriptive title.
- Explain the benefit of the enhancement.
- Describe how it should work.

### Pull Requests

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Keep your changes concise and focused.
4. Ensure your code follows the project's style guide.
5. Submit a PR with a clear description of the changes.

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in the required environment variables
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Coding Standards

### Style Guide

- We use **Prettier** for code formatting. You can run it manually using:
  ```bash
  npm run format
  ```
- Follow the existing architectural patterns
- Use TypeScript features effectively (interfaces, types, etc.).

### Branch Naming

Use descriptive branch names:

- `feature/your-feature-name`
- `fix/your-bug-fix`
- `refactor/your-refactoring`

### Commit Messages

We follow a standard commit message format:

- `feat: add new job search functionality`
- `fix: resolve login timeout issue`
- `docs: update contributing guide`
- `chore: update dependencies`

## Project Structure

- `backend/`: Node.js/Express server with TypeScript.
- `frontend/`: React application.
