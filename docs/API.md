# API Reference — Kanban Board

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication. Include the token as a Bearer header:

```
Authorization: Bearer <jwt-token>
```

### POST /api/auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Ana Garcia",
  "password": "securePass123!"
}
```

**Response 201:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Ana Garcia"
}
```

### POST /api/auth/login

Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePass123!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Ana Garcia",
    "email": "user@example.com"
  }
}
```

### GET /api/auth/profile

Get current user profile. Requires auth.

**Response 200:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Ana Garcia"
}
```

---

## Boards

### GET /api/boards

List all boards for the authenticated user.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Proyecto Alpha",
    "description": "Sprint inicial del proyecto Alpha",
    "accentColor": "blue",
    "cardCount": 7,
    "createdAt": "2026-06-20T10:00:00Z",
    "updatedAt": "2026-06-20T14:30:00Z"
  }
]
```

### POST /api/boards

Create a new board. Automatically creates 3 default columns (To Do, In Progress, Done).

**Request:**
```json
{
  "name": "Proyecto Alpha",
  "description": "Sprint inicial",
  "accentColor": "blue"
}
```

**Response 201:** The board object with columns.

### GET /api/boards/:id

Get board detail with columns.

**Response 200:**
```json
{
  "id": 1,
  "name": "Proyecto Alpha",
  "columns": [
    { "id": 1, "name": "To Do", "position": 0, "maxCards": null },
    { "id": 2, "name": "In Progress", "position": 1, "maxCards": 5 },
    { "id": 3, "name": "Done", "position": 2, "maxCards": null }
  ]
}
```

### PATCH /api/boards/:id

Update board name, description, or accentColor.

### DELETE /api/boards/:id

Delete board and all related data (cascade).

---

## Columns

### POST /api/columns

**Request:** `{ "boardId": 1, "name": "Review", "position": 2 }`

### PATCH /api/columns/:id

**Request:** `{ "name": "In Review", "maxCards": 10 }`

### PATCH /api/columns/:id/position

**Request:** `{ "position": 1 }`

### DELETE /api/columns/:id

Deletes the column. Cards are moved to the first remaining column.

---

## Cards

### GET /api/cards?boardId=1

List cards for a board, ordered by position.

### POST /api/cards

**Request:**
```json
{
  "columnId": 1,
  "title": "Implementar login",
  "description": "Crear formulario de login con JWT",
  "assigneeId": 1,
  "dueDate": "2026-06-25",
  "labels": ["backend", "auth"]
}
```

### PATCH /api/cards/:id/position

Move card to a different column/position.

**Request:**
```json
{
  "columnId": 2,
  "position": 0
}
```

**Position recalculation:**
1. Old column: cards after old position shift up
2. New column: cards at/after new position shift down
3. Moved card updated to new columnId + position

### DELETE /api/cards/:id

Deletes card and shifts remaining cards up.

---

## Activities

### GET /api/activities?boardId=1&limit=50&offset=0

**Response 200:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "userName": "Ana Garcia",
    "action": "moved",
    "entityType": "card",
    "entityId": 5,
    "metadata": "{\"fromColumnId\":1,\"toColumnId\":2}",
    "createdAt": "2026-06-20T14:30:00Z"
  }
]
```

---

## SSE (Server-Sent Events)

### GET /api/sse/board/:id?token=<jwt>

Connect to real-time event stream for a board. Emits:

| Event | Data |
|-------|------|
| `card:created` | `{ cardId, columnId, ...card }` |
| `card:updated` | `{ cardId, changes, ... }` |
| `card:moved` | `{ cardId, fromColumn, toColumn, position }` |
| `card:deleted` | `{ cardId, boardId }` |
| `column:created` | `{ columnId, name, position }` |
