# Architecture Decision Records — Kanban Board

## ADR-001: Signal-First Frontend State

**Context:** Angular 22 introduces signals as a first-class reactive primitive with zoneless change detection.

**Decision:** All component state uses `signal()` and `computed()`. Template bindings read signals with `()`. Only SSE events use RxJS (bridged with `toSignal` or manual subscribes that write to signals).

**Alternatives Considered:**
- RxJS BehaviorSubject for all state (rejected: unnecessary complexity for local UI state)
- NgRx/store (rejected: overkill for this project scope)

**Consequences:** Cleaner component code, automatic change detection, no zone pollution.

---

## ADR-002: SSE over WebSocket

**Context:** The Kanban board needs real-time updates when multiple users work on the same board.

**Decision:** Use Server-Sent Events (SSE) instead of WebSocket.

**Rationale:**
- SSE is unidirectional (server→client), which matches our use case (client never sends events, only HTTP requests)
- SSE uses standard HTTP, no special proxy configuration needed
- Simpler to implement on both server (RxJS Subject + @Sse()) and client (EventSource API with auto-reconnect)
- NestJS has first-class SSE support

**Trade-offs:**
- No client→server real-time communication (not needed here)
- Limited to 6 concurrent connections per domain in HTTP/1.1 (but HTTP/2 solves this)
- No binary frame support (not needed)

---

## ADR-003: TypeORM with SQLite (Dev) / PostgreSQL-Ready Schema

**Context:** The project must work without Neon connectivity (NEON_API_KEY consistently unavailable).

**Decision:** Use SQLite via better-sqlite3 for development with a PostgreSQL-compatible schema. Table and column names use snake_case. All SQL features used are portable (COALESCE, standard JOINs, simple date functions).

**Alternatives Considered:**
- Prisma (different migration approach, more complex setup)
- Raw SQL (loses TypeORM's entity mapping and repository pattern)
- Always Neon (blocked by missing API key)

**Consequences:** Easy local development, production path to Neon requires only connection string change.

---

## ADR-004: Drag and Drop via HTML5 DnD API

**Context:** Cards need drag-and-drop reordering within and across columns.

**Decision:** Use native HTML5 Drag and Drop API instead of a library like @angular/cdk/drag-drop or dnd-kit.

**Rationale:**
- No additional dependency for what's fundamentally a simple interaction
- Full control over drag ghost, drop zone highlighting, and animations
- The interaction model (drag card → drop on column) is straightforward

**Trade-offs:**
- No touch support out of the box (would need fallback)
- More boilerplate than a library
- @angular/cdk/drag-drop provides animations and accessibility built-in
- Decision is pragmatic: no extra dependency, simple enough to implement

---

## ADR-005: Position as Integer with Recalculation

**Context:** Cards within a column have an order; moving a card changes positions.

**Decision:** Use contiguous integer positions (0, 1, 2...) with SQL UPDATE queries to recalculate after every move.

**Alternatives Considered:**
- Fractional indexing (insert between 1.0 and 2.0 → 1.5) — avoids recalculation but causes precision drift over time
- Linked list — more complex querying
- Materialized path — overkill

**Consequences:** Simple and correct but O(n) UPDATE queries per move. Acceptable for the expected scale (hundreds of cards, not thousands).

---

## ADR-006: Inline Templates (No Separate HTML Files)

**Context:** Angular components can use separate `.html` files or inline templates.

**Decision:** Use inline templates (`template: ` backtick string) for all components.

**Rationale:** Single file per component reduces file count and keeps the template co-located with logic. Angular 22's template syntax compiles inline templates as efficiently as external ones.

**Trade-offs:** Longer component files; no syntax highlighting in some editors.
