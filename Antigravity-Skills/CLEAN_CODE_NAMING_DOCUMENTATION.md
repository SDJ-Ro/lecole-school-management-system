# L'ÉCOLE CLEAN CODE, NAMING CONVENTIONS AND DOCUMENTATION STANDARDS

## 1. Practical Clean Code Principles
- **Single Responsibility**: Every function, file, and module must have one clear, cohesive responsibility.
- **Small, Focused Functions**: Keep functions short, focused, and free of unnecessary nesting.
- **Meaningful Names**: Use intention-revealing names for variables, functions, and files.
- **No Magic Values**: Avoid magic numbers and unexplained strings; prefer named constants for repeated values.
- **Clarity over Cleverness**: Prefer readable, explicit code over compressed or "clever" code. Do not reduce line count merely for the sake of line-count reduction.
- **No Speculative Abstraction**: Avoid premature abstraction and speculative reuse. Do NOT create classes, helpers, or abstractions simply to demonstrate Clean Code, SOLID, or design patterns.

---

## 2. Naming Architecture and System

### CSS Architecture (BEM Variant)
- **Component**: `c-component` (e.g., `c-sidebar`, `c-modal`, `c-metric-card`)
- **Element**: `c-component__element` (e.g., `c-sidebar__brand`, `c-modal__header`)
- **Modifier**: `c-component--modifier` (e.g., `c-btn--solid`, `c-metric-card--sand`)
- **State Flags**: `is-active`, `is-open`, `is-collapsed`, `has-error` (or `c-is-active`, `c-is-open`, `c-is-collapsed`, `c-has-error`)

### JavaScript Behavior Hooks (`j-*` and `s-*`)
- **Behavior Hook Prefix**: `j-component`, `j-action`, `j-target` (e.g., `j-sidebar`, `j-sidebar-toggle`, `j-calendar-days`)
- **Preservation Critical**: Existing `j-*` hooks and `s-*` classes carry behavior contracts. They **MUST NOT** be renamed during migration.
- **Separation**: CSS rules must **NEVER** target `j-*` classes for visual styling unless there is a documented reason.

### JavaScript Naming
- **Functions**: `camelCase` (e.g., `renderCalendarGrid`, `wireBarChart`)
- **Variables**: `camelCase` (e.g., `viewDate`, `calendarEvents`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MONTH_NAMES`, `MAX_CALENDAR_YEAR`)
- **Classes**: `PascalCase` (e.g., `WebRouter`, `DashboardController`)

### PHP Naming
- **Classes**: `PascalCase` (e.g., `DashboardController`, `WebRouter`)
- **Methods**: `camelCase` (e.g., `renderView`, `requireRole`)
- **Variables**: `$camelCase` (e.g., `$roleConfig`, `$currentRoute`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_ROLE`, `DB_CHARSET`)

### CSS Custom Properties (Design Tokens)
- **Colors**: `--lecole-color-*` (e.g., `--lecole-color-midnight`, `--lecole-color-sunshine`)
- **Spacing**: `--lecole-spacing-*` (e.g., `--lecole-spacing-md`, `--lecole-spacing-lg`)
- **Radii**: `--lecole-radius-*` (e.g., `--lecole-radius-lg`, `--lecole-radius-full`)
- **Typography**: `--lecole-font-*` (e.g., `--lecole-font-display`, `--lecole-font-body`)

### HTML & DOM Structure
- **Semantic HTML5**: Always use appropriate semantic tags (`<header>`, `<nav>`, `<aside>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- **IDs**: Use `id="..."` ONLY for unique document anchors or stable primary JavaScript hooks (e.g., `id="j-sidebar"`). Prefer classes and `data-*` attributes for reusable behavior.
- **Data Attributes**: Use `data-*` for component metadata and configuration (e.g., `data-grade="Grade 6"`, `data-nav-name="Dashboard"`).

---

## 3. Strict CSS / JS Separation

Maintain a non-negotiable boundary between styling contracts and behavior hooks:

- **`c-*`** = Styling contract (CSS only). CSS targets `c-*` classes. JavaScript should never depend on CSS class names when a dedicated `j-*` hook is appropriate.
- **`j-*`** = Behavior hook (JS query selector only). CSS must never depend on `j-*` hooks unless there is a documented reason.
- **`is-*` / `c-is-*`** = State indicator toggled by JS and styled by CSS.
- **`has-*` / `c-has-*`** = Condition indicator toggled by JS and styled by CSS.

### Example Contract
```html
<button type="button" 
        class="c-button c-button--primary" 
        id="j-submit-event">
  Submit Event
</button>
```

---

## 4. Commenting Standards (Explain WHY, Not WHAT)

Comments must explain **WHY** code exists, not **WHAT** the code does. Avoid comments that merely restate self-explanatory code.

### What Comments Must Explain:
- Architectural decisions and structural boundaries
- Non-obvious algorithms or mathematical formulas
- Preservation constraints and backward-compatibility rules
- Cross-feature dependencies and shared storage contracts
- `localStorage` keys and data schemas
- Browser compatibility workarounds
- Security decisions and permission stubs
- Temporary migration seams

### Examples

#### Bad Comment (Restates Code):
```javascript
// Get sidebar
const sidebar = document.querySelector('#j-sidebar');
```

#### Good Comment (Explains Architectural Context):
```javascript
// The sidebar is rendered by PHP in the MVC architecture.
// JavaScript only controls its interactive state.
const sidebar = document.querySelector('#j-sidebar');
```

#### Good Comment (Explains Shared Storage Contract):
```javascript
// DO NOT rename this key during frontend consolidation.
// Admin Academic and Management Dashboard share this storage contract.
const SHARED_EVENTS_STORAGE_KEY = 'lecole_shared_events';
```

---

## 5. Concise Documentation Standards
- **Module Header Comment**: Every major module (CSS, JS, or PHP) begins with a short header comment stating:
  1. Responsibility
  2. Major dependencies
  3. Important contracts
  4. Whether it is shared or feature-specific
- **Keep it Concise**: Prefer concise documentation. Do not add huge comment blocks to every small function.

---

## 6. Preservation Rule for Existing Naming
Existing project naming is part of the active frontend contract.

- **DO NOT rename existing**:
  - `c-*` classes
  - `j-*` hooks
  - `s-*` hooks/classes
  - IDs
  - `data-*` attributes
  - `localStorage` keys
  - API endpoints
  - PHP routes
  during feature migration unless explicitly approved.
- New code must follow the professional naming conventions above.
- If an existing naming convention is inconsistent, **document it in comments rather than silently changing it**.

---

## 7. Future Controlled Naming Migration
A complete naming cleanup may happen later as a separate, controlled refactoring phase.

That future migration must:
1. Map all consumers across roles.
2. Identify CSS dependencies.
3. Identify JS dependencies.
4. Update all references simultaneously.
5. Verify visual parity.
6. Verify JavaScript behavior.
7. Verify routes and links.
8. Verify accessibility.
9. Verify zero console errors.
10. Commit the changes separately.

**NEVER combine a naming migration with an architectural migration unless explicitly approved.**

---

## 8. Anti-Overengineering Rules
Do **NOT**:
- Create classes for every function.
- Create abstractions for a single consumer.
- Split tiny functions into unnecessary separate files.
- Add design patterns without a real problem to solve.
- Add comments to self-explanatory code.
- Rename code merely because another convention looks nicer.
- Optimize for fewer lines at the expense of readability.
