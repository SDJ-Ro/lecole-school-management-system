# L'ÉCOLE MASTER ENGINEERING RULES
## Project Goal
L'École is an industry-level academic web application using HTML, CSS, Vanilla JavaScript and PHP. The goal is maintainable, modular, optimized and reviewable software. Do not introduce Python, React, Vue, jQuery or unnecessary frameworks.

## Architecture
MVC is the primary architectural pattern.
- Model: data, state and domain responsibilities
- View: presentation
- Controller: coordinates user actions and application flow
Do not create MVC folders merely for appearance. Responsibilities must justify the boundaries.

## Principles
Apply where appropriate: SOLID, DRY, KISS, Separation of Concerns, High Cohesion, Low Coupling, Encapsulation, Dependency Inversion. Do not overengineer.

## Design Patterns
The GoF patterns are a toolbox, not a checklist. Use a pattern only when it solves a real problem. Never force all 23 patterns into the application.

## Roles
Admin, Management, Student, Teacher and Parent. Roles can share UI and functionality, but permissions, routes, labels, actions, data and workflows may differ.

## Shared Code
Extract shared code only when the underlying responsibility is genuinely common. Similarity alone is not sufficient justification.

## Frontend
Keep meaningful features modular. Avoid giant global HTML/CSS/JS files and unnecessary file fragmentation.

## JavaScript
Use the minimum JavaScript necessary, but never remove functional code merely to reduce line count. Prioritize correctness, clarity, maintainability, reuse and performance.

## Preservation
Existing required UI and behavior are protected unless a change is explicitly requested.

## Refactoring
Refactor incrementally: Understand → Map dependencies → Identify duplication → Define target structure → Make the smallest safe change → Verify → Continue.

## AI Behavior
Do not guess when project evidence is available. Do not invent files, APIs, routes or functionality. Do not perform unrelated cleanup. If a change could affect multiple features and the correct approach is uncertain, stop and ask.

## Priority
1. Correctness
2. Security
3. Required functionality
4. Architecture
5. Maintainability
6. Reusability
7. Performance
8. Code-size reduction
