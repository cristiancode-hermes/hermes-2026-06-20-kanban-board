# Database Schema — Kanban Board

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Board : "owns"
    Board ||--o{ Column : "has"
    Board ||--o{ Card : "contains"
    Board ||--o{ Activity : "logs"
    Column ||--o{ Card : "contains"
    User ||--o{ Card : "assigned"

    User {
        int id PK
        string email UK
        string name
        string password
        datetime created_at
        datetime updated_at
    }

    Board {
        int id PK
        string name
        text description
        string accent_color
        int user_id FK
        datetime created_at
        datetime updated_at
    }

    Column {
        int id PK
        string name
        int position
        int max_cards
        int board_id FK
        datetime created_at
        datetime updated_at
    }

    Card {
        int id PK
        string title
        text description
        int position
        date due_date
        text labels
        int column_id FK
        int board_id FK
        int assignee_id FK
        datetime created_at
        datetime updated_at
    }

    Activity {
        int id PK
        int board_id FK
        int user_id FK
        string action
        string entity_type
        int entity_id
        text metadata
        datetime created_at
    }
```

## Schema Design Decisions

### Labels as JSON String
Stored as a JSON array string (e.g., `'["high","feature"]'`) in a TEXT column. This avoids a separate label-pivot table while keeping the ability to query. PostgreSQL's JSON operators can query them natively; SQLite uses LIKE.

### Position as Integer
Uses simple integer positions (0-based). When moving a card, positions are recalculated via SQL UPDATE queries for source and destination columns. This is simpler and more portable than fractional indexing or linked lists.

### snake_case Column Names
All columns use `snake_case` with TypeORM `@Column({ name: 'user_id' })` mappings. This ensures PostgreSQL compatibility and consistent querying.

## Migration Strategy

Development uses SQLite with `synchronize: true` (TypeORM auto-syncs schema). For production Neon/PostgreSQL:

1. Generate migration files using TypeORM CLI
2. Apply migrations during deployment
3. Remove `synchronize: true` in production

## Neon Compatibility

The schema uses only standard SQL types (SERIAL, VARCHAR, TEXT, INTEGER, DATE, TIMESTAMP, BOOLEAN) that work identically on SQLite and PostgreSQL. Indexes are defined for all foreign keys and commonly queried columns.
