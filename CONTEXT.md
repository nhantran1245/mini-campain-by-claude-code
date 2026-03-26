# Mini Campaign Manager - Project Context

## Project Overview

A **full-stack Mini Campaign Manager** — a MarTech tool for creating, managing, and tracking email campaigns.

**Deliverable:** Monorepo with backend and frontend, Docker setup, tests, and documentation  
**Time estimate:** 4-8 hours  
**Key focus:** Business rules enforcement, clean architecture, AI collaboration documentation

---

## Tech Stack

### Backend
- **Runtime:** Node.js with Express
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT
- **Validation:** Zod
- **Testing:** Jest with Supertest

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand or Redux
- **Data Fetching:** React Query or SWR
- **UI Library:** shadcn/ui, Chakra UI, MUI, or Tailwind CSS
- **Forms:** React Hook Form with Zod validation

### Infrastructure
- **Monorepo:** Yarn Workspaces
- **Containerization:** Docker Compose
- **Migrations:** Flyway (versioned SQL migrations)

---

## Project Architecture

### Monorepo Structure

```
/
├── .claude.md                    # Claude Code context
├── CONTEXT.md                    # This file - phases & architecture
├── Requirement.md                # Original requirements
├── README.md                     # User documentation
├── docker-compose.yml            # Container orchestration
├── package.json                  # Root workspace config
├── .gitignore
├── .env.example
│
├── skills/                       # Technical implementation guides
│   ├── backend.md               # Backend patterns & code examples
│   ├── frontend.md              # Frontend patterns & code examples
│   └── database-design.md       # Database design & SQL patterns
│
├── db/                           # Database migrations & seeds
│   ├── migrations/              # Flyway versioned migrations (V1__, V2__, etc.)
│   └── seeds/                   # Flyway repeatable seeds (R__)
│
├── backend/                      # Backend package
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── index.ts             # Express app entry
│       ├── config/              # Configuration
│       │   ├── database.ts
│       │   └── env.ts
│       ├── models/              # Sequelize models
│       │   ├── index.ts
│       │   ├── User.ts
│       │   ├── Campaign.ts
│       │   ├── Recipient.ts
│       │   └── CampaignRecipient.ts
│       ├── middleware/          # Express middleware
│       │   ├── auth.ts
│       │   ├── validate.ts
│       │   └── errorHandler.ts
│       ├── routes/              # API routes
│       │   ├── auth.ts
│       │   ├── campaigns.ts
│       │   └── recipients.ts
│       ├── controllers/         # Request handlers
│       ├── services/            # Business logic
│       ├── validators/          # Zod schemas
│       ├── utils/               # Utilities
│       └── tests/               # Test files
│
└── frontend/                     # Frontend package
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── .env
    ├── index.html
    └── src/
        ├── main.tsx             # React entry
        ├── App.tsx              # Root component
        ├── api/                 # API client
        │   ├── client.ts        # Axios instance
        │   ├── auth.ts
        │   ├── campaigns.ts
        │   └── recipients.ts
        ├── components/          # React components
        │   ├── Layout.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── StatusBadge.tsx
        │   ├── CampaignCard.tsx
        │   ├── CampaignForm.tsx
        │   ├── CampaignStats.tsx
        │   └── RecipientList.tsx
        ├── pages/               # Page components
        │   ├── Login.tsx
        │   ├── Campaigns.tsx
        │   ├── CampaignNew.tsx
        │   └── CampaignDetail.tsx
        ├── hooks/               # Custom React hooks
        ├── store/               # State management
        ├── types/               # TypeScript types
        ├── utils/               # Utilities
        └── __tests__/           # Test files
```

---

## Domain Model

### Core Entities

#### User
```typescript
{
  id: number
  email: string (unique)
  name: string
  password_hash: string
  created_at: Date
}
```

#### Campaign
```typescript
{
  id: number
  name: string
  subject: string
  body: text
  status: 'draft' | 'sending' | 'scheduled' | 'sent'
  scheduled_at: Date | null
  created_by: number (FK → User)
  created_at: Date
  updated_at: Date
}
```

#### Recipient
```typescript
{
  id: number
  email: string
  name: string
  created_at: Date
}
```

#### CampaignRecipient (Junction Table)
```typescript
{
  id: number
  campaign_id: number (FK → Campaign)
  recipient_id: number (FK → Recipient)
  sent_at: Date | null
  opened_at: Date | null
  status: 'pending' | 'sent' | 'failed'
  created_at: Date
}
```

### Relationships
- **User** → **Campaign**: One-to-Many (created_by)
- **Campaign** ↔ **Recipient**: Many-to-Many (through CampaignRecipient)

---

## Business Rules

### Campaign Status State Machine

```
┌───────┐
│ draft │ ────schedule────> ┌───────────┐
└───────┘                    │ scheduled │
    │                        └───────────┘
    │                              │
    └──────────send─────────┐     │
                            │     │
                            ▼     ▼
                        ┌─────────┐
                        │ sending │
                        └─────────┘
                            │
                            ▼
                        ┌──────┐
                        │ sent │
                        └──────┘
```

**Allowed Transitions:**
- `draft` → `scheduled` (via schedule endpoint)
- `draft` → `sending` (via send endpoint)
- `scheduled` → `sending` (via send endpoint)
- `sending` → `sent` (automatic after all recipients processed)

**Restrictions:**
- Edit/Delete: Only in `draft` status
- Schedule: Only from `draft` (or reschedule if `scheduled`)
- Send: From `draft` or `scheduled` only
- **No reversing status** once sending starts

### Critical Business Rules

1. ✅ **Campaigns can only be edited or deleted when status is `draft`**
2. ✅ **`scheduled_at` must be a future timestamp**
3. ✅ **Sending transitions status through: draft → sending → sent**
4. ✅ **Status cannot be undone after sending starts**
5. ✅ **Users can only access their own campaigns**
6. ✅ **Campaign must have at least one recipient**

### Stats Calculation

```json
{
  "total": 100,        // Total recipients
  "sent": 85,          // Successfully sent
  "failed": 15,        // Failed to send
  "opened": 42,        // Opened emails
  "open_rate": 49.4,   // (opened / sent) * 100
  "send_rate": 85.0    // (sent / total) * 100
}
```

---

## API Design

### Response Standards

#### Success Response
```json
{
  "success": true,
  "data": <payload>,
  "message": "optional"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "optional"
  }
}
```

#### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT

#### Campaigns
- `GET /api/campaigns` - List campaigns (paginated, filterable by status)
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details with stats
- `PATCH /api/campaigns/:id` - Update campaign (draft only)
- `DELETE /api/campaigns/:id` - Delete campaign (draft only)
- `POST /api/campaigns/:id/schedule` - Schedule campaign
- `POST /api/campaigns/:id/send` - Send campaign (async simulation)
- `GET /api/campaigns/:id/stats` - Get campaign statistics

#### Recipients
- `GET /api/recipients` - List recipients (paginated)
- `POST /api/recipient` - Create recipient

---

## Implementation Phases

### **Phase 1: Project Setup & Infrastructure**

**Goal:** Initialize monorepo with Docker environment

**Tasks:**
1. Initialize yarn workspace monorepo structure
2. Set up backend package with Express and TypeScript
3. Set up frontend package with Vite + React + TypeScript
4. Create Docker Compose configuration (PostgreSQL + Flyway for migrations)
5. Configure ESLint, Prettier for both packages
6. Set up environment variable templates (.env.example)
7. Initialize Git with proper .gitignore
8. Set up Flyway migration structure for versioned SQL scripts

**Deliverables:**
- Root `package.json` with workspace configuration
- `docker-compose.yml` with PostgreSQL service
- Backend and frontend packages initialized
- Development environment ready

**Success Criteria:**
- ✅ `yarn install` works from root
- ✅ `docker-compose up` starts PostgreSQL
- ✅ Backend dev server starts on port 3000
- ✅ Frontend dev server starts on port 5173
- ✅ TypeScript compilation works in both packages

**Reference:** `.claude.md` for project structure, `skills/backend.md` & `skills/frontend.md` for setup patterns

---

### **Phase 2: Database Design & Implementation**

**Goal:** Create database schema with migrations and seed data

**Tasks:**
1. Install and configure Sequelize with TypeScript
2. Create Flyway SQL migration files for all tables:
   - V1__create_users_table.sql
   - V2__create_campaigns_table.sql
   - V3__create_recipients_table.sql
   - V4__create_campaign_recipients_table.sql
   - V5__add_indexes.sql
3. Create seed data SQL scripts:
   - R__seed_demo_users.sql (repeatable)
   - R__seed_demo_recipients.sql (repeatable)
   - R__seed_demo_campaigns.sql (repeatable)
4. Define Sequelize models with TypeScript interfaces
5. Set up model associations (hasMany, belongsTo, belongsToMany)
6. Write database connection utility
7. Test migrations run successfully via Flyway

**Deliverables:**
- `db/migrations/` with Flyway SQL migration files (V1__, V2__, etc.)
- `db/seeds/` with repeatable seed data SQL scripts (R__)
- `backend/src/models/` with all Sequelize models
- `backend/src/config/database.ts`

**Success Criteria:**
- ✅ Flyway migrations run successfully via Docker Compose
- ✅ All tables created with proper constraints and indexes
- ✅ Seed data populates database with demo data
- ✅ Sequelize models match database schema
- ✅ All model associations work correctly
- ✅ Models have proper TypeScript types

**Reference:** `skills/database-design.md` for Flyway migration patterns, SQL scripts, schema design, and Sequelize best practices

---

### **Phase 3: Backend Implementation**

**Goal:** Build complete REST API with authentication and business logic

#### **Sub-phase 3.1: Core Infrastructure**

**Tasks:**
1. Set up Express application with middleware
2. Implement JWT utilities (sign, verify)
3. Create authentication middleware
4. Implement validation middleware using Zod
5. Create error handling middleware
6. Set up request logging

**Deliverables:**
- `backend/src/index.ts` (Express app)
- `backend/src/middleware/auth.ts`
- `backend/src/middleware/validate.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/src/utils/jwt.ts`
- `backend/src/utils/errors.ts`

#### **Sub-phase 3.2: Authentication**

**Tasks:**
1. Implement password hashing with bcrypt
2. Create auth routes and controller
3. Create Zod validation schemas for auth
4. Write auth integration tests

**Deliverables:**
- `backend/src/routes/auth.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/validators/authValidators.ts`
- `backend/src/utils/hash.ts`
- `backend/tests/auth.test.ts`

#### **Sub-phase 3.3: Campaign Management**

**Tasks:**
1. Create campaign routes, controller, and service
2. Implement CRUD endpoints with business rule enforcement
3. Create Zod validation schemas for campaigns
4. Implement authorization checks (user owns campaign)
5. Write campaign integration tests

**Deliverables:**
- `backend/src/routes/campaigns.ts`
- `backend/src/controllers/campaignController.ts`
- `backend/src/services/campaignService.ts`
- `backend/src/validators/campaignValidators.ts`
- `backend/tests/campaigns.test.ts`

#### **Sub-phase 3.4: Recipient Management**

**Tasks:**
1. Create recipient routes and controller
2. Implement recipient CRUD endpoints
3. Add recipient validation
4. Handle bulk recipient operations

**Deliverables:**
- `backend/src/routes/recipients.ts`
- `backend/src/controllers/recipientController.ts`
- `backend/src/validators/recipientValidators.ts`
- `backend/tests/recipients.test.ts`

#### **Sub-phase 3.5: Campaign Operations**

**Tasks:**
1. Implement schedule campaign endpoint
2. Implement send campaign endpoint (async simulation)
3. Create email service for simulated sending
4. Implement stats calculation and aggregation
5. Handle status transitions (draft → sending → sent)
6. Write comprehensive tests for sending logic

**Deliverables:**
- `backend/src/services/emailService.ts` (simulation)
- `backend/src/services/statsService.ts`
- Extended campaign controller with schedule/send
- `backend/tests/campaign-operations.test.ts`

**Success Criteria:**
- ✅ All endpoints return proper responses
- ✅ Authentication and authorization work correctly
- ✅ Business rules are strictly enforced
- ✅ Tests pass with >80% coverage for critical paths
- ✅ Error handling is consistent
- ✅ Async sending simulation works correctly

**Reference:** `skills/backend.md` for implementation patterns, error handling, testing strategies

---

### **Phase 4: Frontend Implementation**

**Goal:** Build responsive UI with all required features

#### **Sub-phase 4.1: Foundation**

**Tasks:**
1. Configure Vite with path aliases and proxy
2. Set up React Router with route structure
3. Install and configure UI library (shadcn/ui, Tailwind, etc.)
4. Set up Axios with interceptors
5. Configure Zustand or Redux for state management
6. Set up React Query with default options

**Deliverables:**
- `frontend/vite.config.ts`
- `frontend/src/App.tsx` with routing
- `frontend/src/api/client.ts`
- `frontend/src/store/authStore.ts` (or Redux setup)
- `frontend/src/main.tsx`

#### **Sub-phase 4.2: Authentication**

**Tasks:**
1. Create login page with form validation
2. Implement auth store/slice for JWT storage
3. Create protected route wrapper
4. Set up auto-redirect logic
5. Handle logout functionality

**Deliverables:**
- `frontend/src/pages/Login.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/api/auth.ts`

#### **Sub-phase 4.3: Campaign List**

**Tasks:**
1. Create campaigns list page
2. Implement campaign card component
3. Add status badge component
4. Implement pagination or infinite scroll
5. Add status filter dropdown
6. Create loading skeletons and empty states

**Deliverables:**
- `frontend/src/pages/Campaigns.tsx`
- `frontend/src/components/CampaignCard.tsx`
- `frontend/src/components/StatusBadge.tsx`
- `frontend/src/hooks/useCampaigns.ts`
- `frontend/src/types/campaign.ts`

#### **Sub-phase 4.4: Campaign Creation**

**Tasks:**
1. Create campaign creation page
2. Build campaign form with React Hook Form
3. Implement form validation with Zod
4. Create recipient selector component
5. Handle form submission with loading states
6. Add success/error notifications

**Deliverables:**
- `frontend/src/pages/CampaignNew.tsx`
- `frontend/src/components/CampaignForm.tsx`
- `frontend/src/components/RecipientSelector.tsx`
- `frontend/src/hooks/useCreateCampaign.ts`

#### **Sub-phase 4.5: Campaign Detail**

**Tasks:**
1. Create campaign detail page
2. Implement stats visualization component
3. Create recipient list component
4. Add action buttons (Schedule, Send, Delete)
5. Implement confirmation modals
6. Add polling for real-time stats updates

**Deliverables:**
- `frontend/src/pages/CampaignDetail.tsx`
- `frontend/src/components/CampaignStats.tsx`
- `frontend/src/components/RecipientList.tsx`
- `frontend/src/components/CampaignActions.tsx`
- `frontend/src/hooks/useCampaignDetail.ts`

#### **Sub-phase 4.6: Polish & Optimization**

**Tasks:**
1. Implement responsive design for mobile/tablet
2. Add proper error boundaries
3. Optimize performance (React.memo, lazy loading)
4. Add accessibility features (ARIA, keyboard navigation)
5. Write component tests
6. Final UI polish and animations

**Success Criteria:**
- ✅ All pages render correctly and are responsive
- ✅ Forms validate properly with clear error messages
- ✅ API calls work with proper auth headers
- ✅ Loading and error states display appropriately
- ✅ Status badges show correct colors
- ✅ Component tests pass
- ✅ Accessible on keyboard and screen readers

**Reference:** `skills/frontend.md` for React patterns, form handling, state management, component examples

---

## Testing Strategy

### Backend Testing (Minimum Requirements)

**Critical Tests Required:**
1. ✅ User registration and login flow
2. ✅ Campaign CRUD with business rule enforcement
3. ✅ Campaign status transitions and sending simulation

**Additional Recommended Tests:**
- JWT authentication and authorization
- Input validation edge cases
- Stats calculation accuracy
- Error handling scenarios

**Target Coverage:** 80%+ for business logic

### Frontend Testing (Optional but Recommended)

- Component rendering tests
- Form validation tests
- Protected route access control
- User interaction flows

---

## Security Requirements

- [ ] Passwords hashed with bcrypt (10 rounds)
- [ ] JWT with secure secret and expiration
- [ ] All inputs validated with Zod on backend
- [ ] Parameterized queries (Sequelize handles this)
- [ ] User authorization checks on all protected endpoints
- [ ] CORS configured for frontend origin only
- [ ] Environment variables for sensitive configuration
- [ ] Error messages don't expose sensitive data

---

## Database Performance

### Required Indexes

```sql
-- Users
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Campaigns
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by_status ON campaigns(created_by, status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Campaign Recipients
CREATE UNIQUE INDEX idx_campaign_recipients_unique ON campaign_recipients(campaign_id, recipient_id);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_campaign_recipients_campaign_status ON campaign_recipients(campaign_id, status);
```

**Rationale:**
- User email: Fast authentication lookups
- Campaign created_by + status: User's filtered campaign lists
- Campaign scheduled_at: Scheduler queries (partial index for efficiency)
- Campaign recipients unique: Prevent duplicate assignments
- Campaign recipients status: Stats aggregation queries

---

## UI/UX Guidelines

### Status Badge Colors
- `draft` = Grey (#6B7280)
- `scheduled` = Blue (#3B82F6)
- `sending` = Yellow (#EAB308)
- `sent` = Green (#10B981)

### Required States
- ✅ Loading skeletons/spinners for data fetching
- ✅ Empty states with helpful messages
- ✅ Error states with user-friendly messages
- ✅ Success toasts for actions
- ✅ Confirmation modals for destructive actions (Delete, Send)

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

---

## Development Workflow

### Getting Started
```bash
# Clone and setup
git clone <repo-url>
cd mini-campaign-manager
yarn install

# Start Docker services
docker-compose up -d

# Backend setup
cd backend
yarn migrate
yarn seed
yarn dev

# Frontend (in another terminal)
cd frontend
yarn dev
```

### Environment Variables

**Backend (.env)**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/campaign_manager
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:3000/api
```

---

## Deliverables Checklist

- [ ] **Phase 1:** Monorepo initialized, Docker working
- [ ] **Phase 2:** Database schema created, migrations run, seed data loaded
- [ ] **Phase 3:** Backend API complete with all endpoints and tests
- [ ] **Phase 4:** Frontend UI complete with all pages and features
- [ ] **Documentation:** README with setup instructions and "How I Used Claude Code"
- [ ] **Testing:** Minimum 3 critical backend tests passing
- [ ] **Quality:** Code formatted, no console errors, proper error handling
- [ ] **Security:** All security requirements met
- [ ] **Performance:** Database indexes created, pagination implemented

---

## Documentation Requirements

### README.md Must Include:
1. Project overview
2. Tech stack
3. **Local setup instructions** (Docker Compose preferred)
4. **Seed data information**
5. API documentation or link to Postman collection
6. **"How I Used Claude Code" section:**
   - Tasks delegated to Claude Code
   - 2-3 real prompts used
   - Where Claude Code was wrong or needed correction
   - What you would not let Claude Code do and why

---

**For detailed implementation patterns and code examples, refer to:**
- **skills/backend.md** - Backend patterns, auth, validation, testing
- **skills/frontend.md** - React patterns, forms, state management, components
- **skills/database-design.md** - Schema design, migrations, query optimization
