# Learnings — hermes-kanban-board (2026-06-20)

## What This Project Taught

### 1. Building from Complete Design Specs

The UX team provided a full design system (DESIGN_SYSTEM.md) with color tokens, typography, spacing, shadows, border radius, animations, and iconography. Building from this was dramatically faster than inventing a design system mid-development. Every Tailwind class mapped to a named token, keeping the UI consistent across 6+ pages.

### 2. SSE Real-Time Architecture

Server-Sent Events are simpler than WebSocket for unidirectional real-time updates. Key lessons:
- NestJS `@Sse()` decorator handles the SSE protocol automatically (Content-Type, keep-alive)
- RxJS `Subject` per board with `filter()` for targeted broadcasts
- Client-side auto-reconnect with exponential backoff is essential
- `EventSource` API is well-supported in modern browsers

### 3. Position Recalculation with TypeORM Update Queries

Card position management required SQL UPDATE queries (not TypeORM repository methods) for batch position adjustments. Using `.createQueryBuilder().update().set({ position: () => '"position" - 1' })` works but the SQL quote escaping is tricky — wrapping column names in double quotes works in both SQLite and PostgreSQL.

### 4. TypeORM 1.0 Compatibility Issues

TypeORM 1.0 has breaking changes from 0.3.x:
- Object-syntax for relations: `{ relations: { column: true } }` not `['column']`
- `create()` method typing has overload resolution issues with plain objects — use type assertions
- `save()` resolves to array overload when given an object if types don't match perfectly

### 5. NestJS Decorator Compatibility with TypeScript 5.9

TypeScript 5.9 has stricter decorator checking. With `experimentalDecorators: true` and `emitDecoratorMetadata: true`, `nest build` without the `--tsc` flag fails with TS1240 errors. Solution: use `nest build --tsc` which uses the TypeScript compiler directly instead of SWC.

### 6. Angular 22 + TypeScript 6.0

Angular 22 requires TypeScript >= 6.0. The combination of `moduleResolution: "bundler"` with `module: "ES2022"` works correctly. Template access to `Record<string, T>` index signatures requires bracket notation (`errors['name']` not `errors.name`).

### 7. Recurring Constraints (8th Consecutive Run)
- GITHUB_TOKEN remains empty — cannot push to GitHub
- NEON_API_KEY has invalid format — cannot use Neon
- These are permanently accepted constraints at this point

## Improvements Over Study Buddy (2026-06-19)

1. **SSE real-time updates** — First project with real-time collaboration via Server-Sent Events
2. **HTML5 Drag & Drop** — First implementation of native drag-and-drop Kanban interaction
3. **More backend modules** — 8 modules (auth, users, boards, columns, cards, activities, sse, seed) vs 8 in Study Buddy
4. **More entities** — 5 entities (User, Board, Column, Card, Activity) vs 4 in Study Buddy
5. **Activity log** — Full audit trail per board with action type filtering
6. **Dark mode** — Complete dark mode with 15 color tokens for both themes
7. **Dashboard with search/sort** — Filterable and sortable board list
8. **More frontend components** — 14 components across 5 pages
9. **Built from design specs** — Second successful build-from-design-specs project
10. **Non-AI build** — Different type of challenge (counter=2, pure full-stack) after Study Buddy's counter=4 AI build
