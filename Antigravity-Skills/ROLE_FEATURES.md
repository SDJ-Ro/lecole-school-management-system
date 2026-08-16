# L'ÉCOLE ROLE AND FEATURE RULES
Roles: Admin, Management, Student, Teacher, Parent.

Many roles use the same features and UI patterns.

## Shared UI
Common components may include sidebar, navigation, modal, tables, forms, cards, notifications and layouts. A shared component can receive role-specific configuration.

## Role Configuration
Configuration may determine label, route, order, visibility, icon, permission and available action. One shared Sidebar component can render different role navigation configurations.

## Role-Specific Logic
Keep logic separate when permissions, workflows, data, business rules or actions differ.

Same UI does not mean same behavior. Similar behavior does not automatically mean shared code.
