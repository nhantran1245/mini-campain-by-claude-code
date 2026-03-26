# Mini Campaign Manager

A full-stack email campaign management application built with Node.js, React, TypeScript, and PostgreSQL.

---

## Tech Stack

- **Backend**: Node.js + Express + PostgreSQL + Sequelize
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Infrastructure**: Docker Compose + Flyway Migrations

---

## ⚡ Local Setup

### Prerequisites

- **Docker** & Docker Compose installed
- **Free ports**: 3000, 5432, 5173

### Start with Docker

```bash
# Clone repository
git clone https://github.com/nhantran1245/mini-campain-by-claude-code.git
cd mini-campain-by-claude-code

# create .env file
cp .env.example .env 
# Start all services
docker-compose up -d
```

**Access the application:**
- Frontend: http://localhost:5173/
- Backend API: http://localhost:3000/api

### Stop and Clean Up

```bash
# Stop services (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

## 🌱 Seed Data

Demo accounts are automatically created on first startup.

### Login Credentials

**User 1:**
- Email: `john@example.com`
- Password: `password123`

**User 2:**
- Email: `jane@example.com`
- Password: `password123`

### What's Pre-seeded

- **2 users** (john, jane)
- **15 recipients** (email contacts)
- **20 campaigns** (10 per user)
- **175+ email tracking records** (sent, opened, failed statuses)

### How to Access

1. Open http://localhost in your browser
2. Login with `john@example.com` / `password123`
3. You'll see 10 pre-created campaigns with stats

### Reset Data

```bash
# Clear everything and re-seed
docker-compose down -v
docker-compose up -d
```

---

## How I Used Claude Code

**I have implemented this project by VSCode**
First, I created context for Claude model: (CONTEXT.md)[./CONTEXT.md]. I always attach this file to my prompts  to let AI know the context.  
After that, with small project like this, I divided this project by phases (tasks) and specific skills. You can see it in `./skills` folder.  
Finally, I start prompting AI to implement phase by phase with specific skill for this phase by attaching skill to my prompts. This way will reduce context size, and help our prompts more effective.

### What tasks you delegated to Claude Code

I delegated to Claude code almost of my tasks, from source initialization, first implementation, reviewing, refactoring code and fixing bugs.

### 2-3 real prompts you used


3 highlight prompts I have used:

1. Implement:
```bash
Task: Phase 3: Backend Implementation
Context: CONTEXT.md
Skills: backend.md, review.md, architecture.md
```

2. Refactor:

```bash
Task: Refactor UI/UX:
- Moving all hard code value to a constant and enum variables(campaign status, campaign recipients status)
- Validations must matching with BE business logic
Context: CONTEXT.md
Skills: frontend.md, review.md, architecture.md
```

3. Fix bug:

```bash
Task: Fixing UI: validation error message for scheduled campaign should be show directly on the dialog form instead of in the background.
Context: CONTEXT.md
Skills: frontend.md, review.md, architecture.md
```

### Where Claude Code was wrong or needed correction

Almost errors came from frontend due to UI/UX:
- UX behaviors are sometimes not humanable. Example: Error messages is hidden when the form is a dialog, do not prevent invalid value for input,...
- Frontend validation didn't match backend rules


### What you would not let Claude Code do — and why

- Design project architecture: Just let Claude codes, and we architect the system. Any issues related to the system architecture will cause great consequences, and will take so much time to fix if we do not design it.
- Business logic validation: This is some humanable behaviors that I believe we can do it better than AI.
- End to end testing: This is manual testing to make sure our product quality is fine or not.

---