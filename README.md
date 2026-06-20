# Hermes Kanban Board

> A visual project management tool with drag-and-drop Kanban boards, real-time updates via Server-Sent Events, and JWT authentication for teams.

## Features

- **Drag & Drop Kanban** — Move cards across columns with HTML5 DnD API, optimistic updates with revert on error
- **Real-time Collaboration** — Server-Sent Events broadcast card/column changes to all connected users
- **JWT Authentication** — Secure registration and login with bcrypt hashing
- **Board Management** — Create, edit, delete boards with customizable accent colors (6 options)
- **Column Management** — Add, rename, reorder, delete columns with configurable max card limits
- **Card Management** — Full CRUD with title, description, labels (6 colors), due dates, and assignee
- **Activity Log** — Chronological history of all changes per board
- **Dark Mode** — Toggle with localStorage persistence
- **Dashboard** — Overview of all boards with search, sort, and card counts
- **Responsive Design** — Works on desktop and tablet (optimized for keyboard + mouse drag & drop)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (signals, zoneless, Tailwind CSS v4) |
| Backend | NestJS 11 (REST API, Swagger, TypeORM) |
| Database | SQLite (dev) / Neon PostgreSQL-ready schema |
| Auth | JWT with Passport.js + bcryptjs |
| Real-time | Server-Sent Events with RxJS Subjects |

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Angular 22 │────→│  NestJS API  │────→│  SQLite  │
│  (signals)  │←───│  (modules)   │     │  (Neon)  │
└─────────────┘     └──────────────┘     └──────────┘
       │                   │
       │    SSE Events     │
       └───────────────────┘
```

## Prerequisites

- Node.js >= 22.x
- npm >= 10.x

## Local Setup

### 1. Clone and install dependencies

```bash
cd apps/api && npm install
cd apps/web && npm install
```

### 2. Configure environment

```bash
cp .env.example apps/api/.env
# Edit JWT_SECRET with a secure random string
```

### 3. Start the backend

```bash
cd apps/api
npm run start:dev
```

The API runs at `http://localhost:3000` with Swagger docs at `http://localhost:3000/api/docs`.

### 4. Start the frontend

```bash
cd apps/web
npm run start
```

The app runs at `http://localhost:4200`.

### 5. Seed demo data

```bash
cd apps/api
npm run seed
```

Creates 2 demo users and sample boards.

## Demo Users

| Email | Password | Boards |
|-------|----------|--------|
| ana@example.com | 123456 | Proyecto Alpha |
| carlos@example.com | 123456 | Diseno Web |

## Project Structure

```
2026-06-20-kanban-board/
├── apps/
│   ├── api/                 # NestJS backend
│   │   └── src/
│   │       ├── auth/        # JWT authentication
│   │       ├── boards/      # Board CRUD
│   │       ├── columns/     # Column CRUD + reorder
│   │       ├── cards/       # Card CRUD + position moves
│   │       ├── activities/  # Activity log
│   │       ├── sse/         # Server-Sent Events
│   │       ├── users/       # User entity & service
│   │       ├── seed/        # Demo data seeder
│   │       └── common/      # Shared decorators, filters
│   └── web/                 # Angular 22 frontend
│       └── src/
│           ├── app/
│           │   ├── pages/       # Login, Register, Dashboard, Board
│           │   ├── components/  # KanbanColumn, KanbanCard, Modals, etc.
│           │   ├── services/    # Auth, Board, Card, SSE, etc.
│           │   └── guards/      # Auth guard
│           └── styles.css       # Tailwind CSS v4 theme
├── docs/                    # Documentation
└── .env.example
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/profile | Yes | Current user profile |
| GET | /api/boards | Yes | List user's boards |
| POST | /api/boards | Yes | Create board (+ 3 default columns) |
| GET | /api/boards/:id | Yes | Board detail with columns |
| PATCH | /api/boards/:id | Yes | Update board |
| DELETE | /api/boards/:id | Yes | Delete board |
| POST | /api/columns | Yes | Create column |
| PATCH | /api/columns/:id | Yes | Update column |
| PATCH | /api/columns/:id/position | Yes | Reorder column |
| DELETE | /api/columns/:id | Yes | Delete column |
| GET | /api/cards?boardId=:id | Yes | List board cards |
| POST | /api/cards | Yes | Create card |
| GET | /api/cards/:id | Yes | Card detail |
| PATCH | /api/cards/:id | Yes | Update card |
| PATCH | /api/cards/:id/position | Yes | Move card (column + position) |
| DELETE | /api/cards/:id | Yes | Delete card |
| GET | /api/activities?boardId=:id | Yes | Activity log |
| GET | /api/sse/board/:id | Yes (query token) | SSE real-time events |

## Roadmap

- [ ] **GitHub Push** — Requires GITHUB_TOKEN environment variable
- [ ] **Neon PostgreSQL** — Production database with pgvector for future ML features
- [ ] **Frontend Component Tests** — Unit tests for Angular components
- [ ] **CI Pipeline** — GitHub Actions for automated build/lint/test
- [ ] **Card Attachments** — File upload support
- [ ] **Team Invitations** — Multi-user board collaboration
- [ ] **Board Archive** — Archive/unarchive functionality
- [ ] **CSV Export** — Export board data to CSV
- [ ] **Email Notifications** — On card assignment changes
- [ ] **Mobile Layout** — Responsive design for phones

## License

MIT
