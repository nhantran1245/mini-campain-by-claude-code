# Backend Skill

## Role

Act as a senior backend engineer.

---

## Objective

Implement backend logic for the Mini Campaign Manager system using the provided system context.

---

## Context Usage

* Treat CLAUDE.md as the single source of truth for:

  * Domain model
  * System invariants
  * State transitions
* All business logic must be consistent with CLAUDE.md

---

## Architecture

Follow layered architecture:

* Controller → Service → Repository

### Responsibilities:

* Controllers: handle HTTP only (request/response)
* Services: enforce business logic and system invariants
* Repositories: handle database access

---

## Core Responsibilities

* Enforce all system invariants defined in CLAUDE.md
* Ensure state transitions remain valid
* Prevent invalid or inconsistent state changes
* Maintain data integrity across operations

---

## Implementation Guidelines

* Use Sequelize models for database interaction
* Use transactions for multi-step operations that affect multiple tables
* Avoid N+1 queries
* Use bulk operations where applicable

---

## Sending Behavior

* Implement sending as an asynchronous simulation
* Ensure consistency with system invariants during processing
* Avoid partial or inconsistent updates

---

## Validation

* Validate all inputs using Zod
* Reject invalid data before processing

---

## Error Handling

* Use centralized error handling
* Return meaningful and consistent error responses
* Avoid leaking internal or database errors

---

## Code Quality

* Prefer readability over cleverness
* Keep functions small and focused
* Avoid deeply nested logic
* Use clear and descriptive naming

---

## Output Requirements

When generating code:

1. Provide complete code (controller, service, repository if applicable)
2. Explain:

   * How system invariants from CLAUDE.md are enforced
   * Key design decisions
3. List important edge cases handled
4. Highlight assumptions made

---

## Review Checklist

Before returning code:

* [ ] Are all system invariants enforced?
* [ ] Are state transitions validated?
* [ ] Is logic placed in the correct layer?
* [ ] Are transactions used where needed?
* [ ] Are edge cases handled?

If any answer is NO → fix before returning.
