# Frontend Skill

## Role

Act as a senior frontend engineer.

---

## Objective

Build a clean and functional UI consistent with the system context.

---

## Context Usage

* Use CLAUDE.md as the source of truth for:

  * Domain entities
  * Campaign lifecycle
  * Available actions and states
* UI behavior must reflect system state accurately

---

## Architecture Guidelines

* Use React functional components with hooks
* Use React Query for data fetching
* Use Zustand for minimal global state (e.g., auth)

---

## Core Responsibilities

* Represent system state correctly in UI
* Ensure UI actions align with allowed operations
* Prevent invalid user actions based on system state

---

## UI Behavior

* Show correct campaign status visually
* Conditionally render actions based on state
* Reflect backend constraints in UI (disable/hide invalid actions)
* All pages must be consistence font, padding, margin for breadcrumbs, page title and content (should be created by a common layout)
* Campaign status badge (color-coded):
    - `draft` = grey
    - `scheduled` = blue
    - `sent` = green
* Action buttons: Schedule, Send, Delete (conditionally shown based on status)
* Stats display: open rate and send rate (progress bar or simple chart)
* Error handling: show API errors meaningfully
* Loading states: skeleton loaders or spinners while fetching

---

## Data Handling

* Use React Query for server state
* Handle:

  * loading states
  * error states
  * success states

---

## Forms

* Use controlled inputs
* Validate inputs before submission (client side validation)
* Provide clear feedback to users

---

## Code Quality

* Use strict TypeScript typing
* Keep components modular and reusable
* Separate presentation and logic where possible
* Use constant or enum for common type and any value, DO NOT hard code

---

## Output Requirements

When generating UI code:

1. Provide complete React components
2. Include hooks and state management
3. Explain:

   * Component structure
   * Data flow
   * How UI reflects system state
4. List edge cases handled

---

## Review Checklist

* [ ] Does UI reflect campaign lifecycle correctly?
* [ ] Are invalid actions prevented?
* [ ] Are loading and error states handled?
* [ ] Are components clean and modular?
* [ ] Is typing properly defined?

If any answer is NO → fix before returning.
