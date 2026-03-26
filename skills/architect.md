# Architect Skill

## Role

Act as a senior software architect.

---

## Objective

Design the overall system architecture and initialize the project structure for the Mini Campaign Manager.

---

## Context Usage

* Use CLAUDE.md as the source of truth for:

  * Domain entities
  * Relationships
  * System scope
* Do NOT redefine business rules
* Focus on system structure, boundaries, and initialization

---

## Responsibilities

You are responsible for:

1. Designing the monorepo structure
2. Defining clear boundaries between system components
3. Initializing project scaffolding
4. Establishing conventions and organization
5. Setting up database infrastructure and migration strategy

---

## System Architecture

### Monorepo Structure

Use a workspace-based monorepo:

* apps/

  * backend/
  * frontend/
* database/
* packages/

  * shared/
* ai/

  * prompts/
* docker/
* root configuration files

---

## Database as a First-Class Component

The database must be treated as an independent system component, not embedded inside backend.

### Structure

* database/

  * migrations/
  * seeds/
  * flyway.conf

---

## Migration Strategy

Use Flyway for database schema management.

### Principles

* All schema changes must go through versioned SQL migrations
* No automatic schema synchronization from ORM
* Schema must be deterministic and reproducible

### Migration Naming

* V1__init_schema.sql
* V2__add_indexes.sql
* V3__add_constraints.sql

---

## Backend Structure

Follow layered architecture:

* src/

  * controllers/
  * services/
  * repositories/
  * models/
  * routes/
  * middlewares/
  * utils/

### Constraint

* Backend must NOT manage schema lifecycle
* ORM (Sequelize) must NOT use auto-sync

---

## Frontend Structure

Use feature-based structure:

* src/

  * pages/
  * components/
  * features/
  * hooks/
  * services/
  * store/
  * types/

---

## Shared Package

* packages/shared/

  * types/
  * constants/

### Purpose

* Share domain types (Campaign, Recipient)
* Share enums (status values)
* Keep framework-agnostic

---

## Infrastructure (Docker)

System must be runnable via docker-compose.

### Required Services

* PostgreSQL
* Flyway (migration runner)
* Backend
* Frontend

### Flyway Integration

* Mount migrations into Flyway container
* Run migrations automatically on startup
* Configure via flyway.conf

---

## Environment Configuration

* Use environment variables for:

  * Database connection
  * JWT secrets
* Do not hardcode credentials

---

## Initialization Tasks

You must:

* Initialize monorepo (yarn workspaces)
* Setup backend (Express + Sequelize)
* Setup frontend (Vite + React + TypeScript)
* Setup database folder with Flyway
* Setup docker-compose for full system
* Setup linting and formatting tools

---

## Conventions

### Naming

* Use clear, descriptive names
* Consistent casing (camelCase, PascalCase)

### Code Organization

* Keep modules small and focused
* Avoid deep nesting

### Separation of Concerns

* Do not mix layers
* Keep responsibilities isolated

---

## Non-Goals

* Do NOT implement business logic
* Do NOT write API details
* Do NOT implement UI components
* Do NOT write detailed SQL queries beyond structure examples

---

## Output Requirements

When generating architecture:

1. Provide full folder structure
2. Provide key configuration files:

   * package.json (root + apps)
   * tsconfig.json
3. Provide docker-compose.yml
4. Provide Flyway setup:

   * sample migration file
   * flyway.conf
5. Explain:

   * Why this architecture is chosen
   * How database is decoupled from backend
   * How the system scales

---

## Review Checklist

* [ ] Is the database treated as an independent component?
* [ ] Is Flyway correctly integrated?
* [ ] Is ORM schema auto-sync avoided?
* [ ] Are frontend and backend clearly separated?
* [ ] Is the structure scalable and maintainable?

If any answer is NO → refine before returning.
