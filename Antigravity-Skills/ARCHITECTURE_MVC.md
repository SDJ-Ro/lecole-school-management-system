# L'ÉCOLE MVC ARCHITECTURE
MVC is the primary application architecture.

## Model
Responsible for data/state, domain-related logic and data-access boundaries where appropriate.

## View
Responsible for presentation, rendering and user-facing structure.

## Controller
Responsible for receiving user actions, coordinating Model/View/application services and controlling application flow.

Do not put all business logic into controllers. Do not make Models responsible for presentation. Do not make Views responsible for application/business decisions.

## Feature-Based Organization
Organize meaningful functionality by feature where practical. A feature may contain MVC responsibilities without requiring every feature to have identical folders.

## Shared vs Role-Specific
Shared feature/domain behavior should be centralized where genuinely common. Role-specific presentation, permissions, labels, routes and workflows may remain under role-specific modules/configuration.

## Dependency Direction
Avoid unnecessary circular dependencies. Keep boundaries understandable and explicit.

## Migration
Understand current responsibilities → map dependencies → identify shared behavior → define MVC boundaries → refactor incrementally → verify equivalence.
