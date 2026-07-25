# Solar CRM

A full-stack CRM application for managing the complete solar sales and installation lifecycle. This application helps organizations manage customers, leads, quotations, installations, warranties, and after-sales service from a single platform.

## Features

* **Authentication**: Email and password login using JWT access and refresh tokens.
* **Authorization (RBAC)**: Role-based access control with customizable permissions.
* **User Management**: Creation, updating, and role assignment for team members.
* **Contact Management**: Centralized store for customer and stakeholder contact details.
* **Lead Management**: Track lead sources, status, assigned sales reps, and associated products.
* **Opportunity Management**: Pipeline tracking from qualification to negotiation and closure.
* **Product Management**: Catalog of solar equipment including panels, inverters, and batteries.
* **Manufacturer Management**: Tracking of equipment brands and manufacturer contact details.
* **Category Management**: Classification of inventory items for easier search and organization.
* **Site Survey**: Collection of physical parameters including roof type, area, and shadow analysis.
* **Quotation Management**: Generation of itemized financial quotes tied to active opportunities.
* **Installation Management**: Scheduling, tracking, and assignment of physical setups.
* **Warranty Management**: Tracking of warranty certificates, start dates, and terms.
* **AMC Management**: Scheduling and tracking of Annual Maintenance Contracts.
* **Service Request Management**: Post-installation ticketing system for technical issues.
* **Dashboard**: Key metric reporting for organizations, sales agents, and coordinators.
* **Background Jobs using BullMQ**: Queueing system for decoupled processing tasks.
* **Redis Caching**: Key-value store for session management and token blacklists.
* **Email Queue**: Asynchronous mailing system for notifications and confirmations.
* **Secure APIs**: Request validation, rate limiting, and cookie security flags.
* **REST Architecture**: Clean HTTP method mappings and JSON payloads.

## Tech Stack

### Backend
* **Node.js**: Server environment.
* **TypeScript**: Type safety and modern language features.
* **Express.js**: REST API framework.
* **PostgreSQL**: Relational database storage.
* **Prisma ORM**: Database access and migrations.
* **Redis**: Cache storage and BullMQ message broker.
* **BullMQ**: Queue management for background workers.
* **JWT Authentication**: Short-lived access tokens.
* **Cookie-based Authentication**: HTTP-only cookie delivery for refresh tokens.
* **Zod Validation**: Payload and schema validation.

### Frontend
* **React**: UI library.
* **TypeScript**: Type safety for client code.
* **Vite**: Frontend build tool and development server.
* **Tailwind CSS**: Utility-first CSS styling.
* **React Router**: Client-side routing.

## Project Structure

```text
solar-crm/
├── backend/
│   ├── prisma/
│   │   ├── constants/             # Seed data and static parameters
│   │   ├── migrations/            # SQL migration history
│   │   ├── schema.prisma          # Database schema models
│   │   └── seed.ts                # Database seed script
│   ├── src/
│   │   ├── config/                # Environment, mailer, queue, and database configs
│   │   ├── jobs/                  # BullMQ producers
│   │   ├── lib/                   # Shared libraries
│   │   ├── middlewares/           # Authentication, validation, and error middlewares
│   │   ├── modules/               # Domain-specific logic (modular design)
│   │   │   ├── auth/              # Authentication routes, controllers, and services
│   │   │   ├── leads/             # Lead management domain
│   │   │   ├── opportunities/     # Opportunity and pipeline management
│   │   │   └── ...                # Other domain-specific modules
│   │   ├── routes/                # Global route registry
│   │   ├── types/                 # Express and model type extensions
│   │   ├── utils/                 # General helpers and constants
│   │   ├── workers/               # BullMQ queue consumers and background workers
│   │   ├── app.ts                 # Express application initialization
│   │   └── server.ts              # Server bootstrapper and job runner
│   ├── .env.example               # Template environment configuration
│   ├── package.json               # Node.js dependencies and scripts
│   └── tsconfig.json              # TypeScript compilation rules
└── frontend/
    ├── assets/
    │   └── css/                   # Global style definitions
    ├── js/
    │   ├── components/            # UI components (sidebar, modal, toast)
    │   ├── pages/                 # Route view containers (login, opportunities)
    │   ├── services/              # API interceptors and requests
    │   ├── app.js                 # App entry and initialization
    │   └── router.js              # View router and route guards
    └── index.html                 # HTML entry point
```

## Architecture Overview

The system uses a modular structure where each domain context resides in a dedicated module directory containing its own controllers, services, validation schemas, and routing rules.

* **Decoupled Job Queue**: The server uses BullMQ backed by Redis to run background workloads independently from the HTTP request-response cycle.
* **Data Access Layer**: All database interactions go through Prisma ORM, which provides type-safe query generation and migration tracking.
* **Data Validation**: Request payloads are parsed and filtered at the route boundary using Zod schemas before being passed to controllers.

## Request Flow Diagram

```text
Client Request
      │
      ▼
┌─────────────┐
│    Route    │ (backend/src/routes/index.ts)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Middleware  │ (authGuard, validateBody using Zod)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │ (Extracts inputs, invokes services, formats response)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │ (Contains business rules and logic)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Prisma    │ (ORM database client)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │ (Database storage)
└─────────────┘
```

### Background Worker Flow

```text
Express Route
      │
      │ (Triggers event)
      ▼
┌─────────────┐
│  Queue Job  │ (backend/src/jobs/)
└──────┬──────┘
       │
       │ (Enqueues work item)
       ▼
┌─────────────┐
│ Redis Broker│
└──────┬──────┘
       │
       │ (Pulls task asynchronously)
       ▼
┌─────────────┐
│   Worker    │ (backend/src/workers/)
└─────────────┘
```

## Database Overview

The application database is structured around organizations to allow data segregation.

* **Organization**: The primary tenant. All users, contacts, leads, products, installations, warranties, and service agreements are linked to an organization.
* **User**: Represents team members. A user can have multiple roles (via UserRole joining table) to govern access permissions.
* **Contact**: Represents individual clients. Each contact belongs to an organization and can have multiple addresses.
* **Lead & Opportunity**: Leads capture initial interest. A qualified lead converts to an Opportunity, which tracks the sales pipeline stages.
* **Site Survey**: Attached to an opportunity to capture roof layout, area, load capacity, and shadow analysis photos.
* **Quotation**: Generated for an opportunity. Includes line items containing specific products and pricing.
* **Installation**: Created upon quotation acceptance. Assignable to technical teams and captures scheduling dates.
* **Warranty & AMC**: Post-installation entities. Warranty details equipment coverage, while AMC tracks maintenance contracts.
* **Service Request**: Technical support tickets linked to an active installation for troubleshooting and repair tracking.

## Installation

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL (v14 or higher)
* Redis (v6 or higher)

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solar-crm.git
   cd solar-crm
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up the backend environment:
   ```bash
   cp .env.example .env
   # Edit the .env file with your local database and Redis credentials
   ```

4. Generate the database client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Seed the database with default roles, permissions, and initial admin credentials:
   ```bash
   npm run prisma:seed
   ```

6. Install frontend dependencies:
   ```bash
   cd ../frontend
   # [TODO] Add npm install instruction once npm initialization is completed for frontend
   ```

## Environment Variables

### Backend Configuration
Create a `.env` file in the `backend` directory. See the configuration parameters below:

```ini
# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/solar_crm?schema=public"

# Server Configuration
PORT=7000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Authentication Secrets
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# Redis & Message Queue Configuration
REDIS_URL="redis://localhost:6379"
```

## Running the Project

### Start Backend in Development Mode
```bash
cd backend
npm run dev
```

### Start Background Workers
The backend background workers start automatically with the Express server in the main process thread.

### Start Frontend in Development Mode
```bash
cd frontend
# [TODO] Add npm run dev command once frontend package configuration is completed
# Current local hosting workaround:
npx serve -l 5173
```

## API Documentation

* [TODO] Expose automated Swagger documentation by mounting `swagger-jsdoc` options in `backend/src/app.ts`.

### Core Endpoint Prefix
All routes are prefixed with `/api/v1`.

### Key Endpoints

| Resource | Method | Path | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/login` | Log in user, issues access token, sets refresh cookie | Public |
| | POST | `/auth/refresh` | Generate new access token using refresh cookie | Public |
| | POST | `/auth/logout` | Revoke tokens and clear cookie storage | Public |
| **Leads** | GET | `/leads` | List organization leads | Authenticated |
| | POST | `/leads` | Create a new lead | Authenticated |
| **Opportunities** | GET | `/opportunities` | List active sales opportunities | Authenticated |
| | GET | `/opportunities/:id/installation` | Get installation details for an opportunity | Authenticated |
| **Quotations** | GET | `/quotations` | List generated price quotes | Authenticated |
| **Dashboard** | GET | `/dashboard` | Fetch organizational metrics and statistics | Authenticated |

## Deployment

### Backend Deployment

1. Compile TypeScript source code to JavaScript:
   ```bash
   cd backend
   npm run build
   ```

2. Run database migrations on the target production database:
   ```bash
   npx prisma migrate deploy
   ```

3. Configure environmental variables on the host environment (AWS, Render, Heroku, or VPS).

4. Run the production build:
   ```bash
   npm run start
   ```

### Frontend Deployment

1. Build static optimization assets:
   ```bash
   cd frontend
   # [TODO] Add npm run build command once frontend build tool is set up
   ```

2. Deploy the built static files (`dist` folder) to a static hosting platform (Vercel, Netlify, Cloudflare Pages, S3).

## Screenshots

### 1. Authentication
![Login Portal](screenshots/login.png)
*Secure login portal for enterprise tenants using JWT credentials.*

### 2. Dashboard Overview
![Dashboard Overview](screenshots/dashboard.png)
*Analytics dashboard showing total revenue, installation statuses, accepted quotations, and leads pipeline progression.*

### 3. Contact Management
| Contacts List | Create Contact Modal |
| :---: | :---: |
| ![Contacts List](screenshots/contacts.png) | ![Create Contact Modal](screenshots/create-contact.png) |
| *Centralized customer & stakeholder directory.* | *Form to create new customer profiles.* |

### 4. Product Catalog
| Products List | Add Product Modal |
| :---: | :---: |
| ![Products List](screenshots/products.png) | ![Add Product Modal](screenshots/add-product.png) |
| *Catalog of panels, inverters, and battery systems.* | *Form to add equipment to inventory.* |

### 5. Leads Pipeline & Management
| Leads Pipeline | Create Lead Profile |
| :---: | :---: |
| ![Leads Pipeline](screenshots/leads.png) | ![Create Lead Profile](screenshots/create-lead.png) |
| *Track lead sources, budgets, and status changes.* | *Form to log product interests and budget.* |

### 6. Sales Opportunities
![Opportunities Management](screenshots/opportunities.png)
*Detailed sales pipeline tracking revenue value, win probability, close dates, and ownership.*

### 7. Administrative Controls
| Employees Directory | Roles & Permissions (RBAC) | Settings Page |
| :---: | :---: | :---: |
| ![Employees Directory](screenshots/employees.png) | ![Roles & Permissions](screenshots/roles.png) | ![Settings Page](screenshots/settings.png) |
| *Manage team member logins and states.* | *Granular access controls.* | *Profile & Organization details.* |

## Future Improvements

* Add a full unit and integration test suite using Jest and Supertest.
* Complete Swagger endpoint configuration for interactive API testing.
* Add support for multi-file site photos upload using AWS S3.
* Add SMS notifications queue alongside the existing Email worker.

## License

This project is licensed under the [ISC License](LICENSE).