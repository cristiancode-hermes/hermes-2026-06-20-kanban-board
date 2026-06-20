# Frontend Architecture — Kanban Board

## Signal State Architecture

All component state uses Angular signals. No RxJS BehaviorSubjects are used for UI state.

### Core Pattern

```typescript
// Loading/Empty/Error state pattern
const items = signal<Item[]>([]);
const loading = signal(false);
const error = signal<string | null>(null);
const isEmpty = computed(() => !loading() && items().length === 0);

// Template
@if (loading()) {
  <app-loading-skeleton />
} @else if (error()) {
  <app-error-state [message]="error()" (retry)="load()" />
} @else if (isEmpty()) {
  <app-empty-state />
} @else {
  @for (item of items(); track item.id) {
    <app-item [item]="item" />
  }
}
```

### Board Page Signal State

```typescript
const board = signal<Board | null>(null);
const columns = signal<Column[]>([]);
const cards = signal<Card[]>([]);
const loading = signal(true);
const error = signal<string | null>(null);
const sseStatus = signal<'connected' | 'reconnecting' | 'disconnected'>('connected');
const selectedCard = signal<Card | null>(null);
const activityOpen = signal(false);

// Derived state
const cardsByColumn = computed(() => {
  const map = new Map<number, Card[]>();
  for (const col of columns()) {
    map.set(col.id, cards()
      .filter(c => c.columnId === col.id)
      .sort((a, b) => a.position - b.position));
  }
  return map;
});
```

### Dashboard Signal State

```typescript
const boards = signal<Board[]>([]);
const loading = signal(true);
const error = signal<string | null>(null);
const searchQuery = signal('');
const sortBy = signal<'updated' | 'name' | 'created'>('updated');

const filteredBoards = computed(() => {
  const query = searchQuery().toLowerCase();
  return boards()
    .filter(b => b.name.toLowerCase().includes(query))
    .sort(/* according to sortBy */);
});
```

## SSR/Services

Data fetching services expose methods that return Observables (from HttpClient). Components subscribe and write results to signals:

```typescript
// Service
getBoards(): Observable<Board[]> {
  return this.http.get<Board[]>(`${this.apiUrl}/boards`);
}

// Component
loadBoards(): void {
  this.loading.set(true);
  this.error.set(null);
  this.boardService.getBoards().subscribe({
    next: (boards) => {
      this.boards.set(boards);
      this.loading.set(false);
    },
    error: (err) => {
      this.error.set(err.message);
      this.loading.set(false);
    },
  });
}
```

## SSE Integration

The SseService connects via EventSource to `/api/sse/board/:id?token=...` and emits typed events through a callback-based interface:

```typescript
connect(boardId: number, handlers: SseHandlers): void {
  const url = `${this.apiUrl}/sse/board/${boardId}?token=${token}`;
  this.eventSource = new EventSource(url);
  // ... handlers.onCardCreated, onCardMoved, etc.
}
```

Auto-reconnect with 3-second intervals (max 10 attempts) with visual status indicator (green/yellow/red).

## Drag & Drop

Uses native HTML5 DnD API:

1. **dragstart**: Set drag data (card ID), add dragging CSS class
2. **dragover**: Prevent default to allow drop, highlight drop zone
3. **drop**: Optimistic UI update, call API, revert on error
4. **dragend**: Remove dragging CSS

Optimistic updates show immediate feedback. On API failure, the card reverts to its original position and an error toast appears.

## Tailwind CSS v4 Theme

Uses `@theme` in `styles.css` (not tailwind.config.js):

```css
@import "tailwindcss";
@theme {
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  /* ... other tokens from DESIGN_SYSTEM.md */
}
@custom-variant dark (&:where(.dark, .dark *));
```

Dark mode toggles the `dark` class on `document.documentElement`.

## Zoneless Change Detection

Configured in app.config.ts:

```typescript
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // ...
  ],
};
```

All state mutations go through signals, which trigger Angular's change detection automatically without zone.js.
