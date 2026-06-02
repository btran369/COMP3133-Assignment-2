# 101513060_comp3133_assignment2

## Employee Management System — Full Stack (Angular + Node.js + GraphQL)

**Student:** 101513060
**Course:** COMP 3133 — Full Stack Development II

---

## Overview

A full-stack employee management application with an Angular 19 frontend and a Node.js/Express/GraphQL backend, bundled together in a single repository. The backend serves both the GraphQL API and the built Angular app from the same port.

## Project Structure

```
101513060_comp3133_assignment2/
├── docker-compose.yml
├── Dockerfile
├── package.json              # Root scripts (build, install, start)
├── backend/
│   ├── package.json
│   ├── .env                  # MongoDB, JWT, Cloudinary config
│   └── src/
│       ├── server.js          # Express server (GraphQL + REST upload + static)
│       ├── config/
│       │   ├── db.js          # MongoDB connection
│       │   └── cloudinary.js  # Cloudinary upload helper
│       ├── graphql/
│       │   ├── schema.js      # GraphQL schema (types, queries, mutations)
│       │   ├── resolvers.js   # Business logic for all operations
│       │   └── auth.js        # JWT sign/verify/guard
│       ├── models/
│       │   ├── Employee.js    # Mongoose Employee model
│       │   └── User.js        # Mongoose User model (bcrypt hashing)
│       └── utils/
│           └── errors.js      # GraphQL error helpers
└── frontend/
    ├── package.json
    ├── angular.json
    └── src/
        ├── app/
        │   ├── components/    # Login, Signup, Employee CRUD screens
        │   ├── services/      # GraphqlService, AuthService
        │   ├── guards/        # AuthGuard (route protection)
        │   ├── pipes/         # SalaryPipe, TruncatePipe
        │   ├── models/        # TypeScript interfaces
        │   ├── app.routes.ts  # Lazy-loaded routing
        │   └── app.config.ts  # Standalone app providers
        ├── environments/
        └── styles.scss        # Global dark theme
```

## Features

### Backend (GraphQL API)
- **Authentication:** Signup, Login (username or email), JWT tokens
- **Employee CRUD:** Add, View, Update, Delete employees
- **Search:** Filter employees by department or designation (case-insensitive)
- **Photo Upload:** REST `POST /upload` endpoint → Cloudinary → returns URL
- **Static Serving:** Serves the Angular build for production deployment

### Frontend (Angular 19)
- **Standalone Components** with lazy-loaded routes
- **Reactive Forms** with full validation and error messages
- **Angular Material** dark-themed UI
- **Photo Upload** with preview (uploads to `/upload`, gets Cloudinary URL, sends URL in GraphQL mutation)
- **Session Management** via AuthService + route guards
- **Custom Pipes:** SalaryPipe (currency formatting), TruncatePipe
- **Search/Filter** employees by department or designation

## Quick Start

### Prerequisites
- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`
- MongoDB Atlas connection (or local MongoDB)

### 1. Install everything
```bash
npm run install:all
```

### 2. Configure backend
Edit `backend/.env`:
```
PORT=4000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Development (two terminals)
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && ng serve
```
Frontend runs on `http://localhost:4200`, backend on `http://localhost:4000`.

### 4. Production (single port)
```bash
npm run build:frontend
npm start
```
Both API and app are served from `http://localhost:4000`.

### 5. Docker
```bash
docker-compose up --build
```

## API Endpoints

### GraphQL (`POST /graphql`)

| Operation | Type | Description |
|-----------|------|-------------|
| `Login` | Query | Authenticate with username/email + password |
| `Signup` | Mutation | Create new user account |
| `GetAllEmployees` | Query | List all employees (auth required) |
| `SearchEmployeeByEid` | Query | Get single employee by ID |
| `SearchEmployeeByDesignationOrDepartment` | Query | Filter employees |
| `AddEmployee` | Mutation | Create employee (with optional photo URL) |
| `UpdateEmployeeByEid` | Mutation | Update employee fields |
| `DeleteEmployeeByEid` | Mutation | Delete employee |

### REST

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload photo (multipart form, returns `{ url }`) |

## Backend Changes from Assignment 1

1. **Removed `graphql-upload`** — replaced with a REST `/upload` endpoint using `multer`
2. **Added `employee_photo`** as a `String` field in `EmployeeInput` and `UpdateEmployeeInput` (receives Cloudinary URL)
3. **Removed duplicate `/graphql` middleware** registration in `server.js`
4. **Added static file serving** for the Angular production build
5. **Case-insensitive search** for department/designation queries
6. **Removed `uploadScalar.js`** — no longer needed

## Deployment

Build the frontend, then deploy the entire project to any Node.js host:

```bash
npm run build:frontend
# Deploy the whole project — backend serves everything
```

Tested platforms: Render, Vercel (serverless), Railway, Heroku.
