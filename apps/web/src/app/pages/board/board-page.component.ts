import { Component, inject, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoardService, Board } from '../../services/board.service';
import { ColumnService, Column } from '../../services/column.service';
import { CardService, Card } from '../../services/card.service';
import { SseService } from '../../services/sse.service';
import { ActivityService, ActivityItem } from '../../services/activity.service';
import { ToastService } from '../../services/toast.service';
import { BoardHeaderComponent } from '../../components/board-header/board-header.component';
import { KanbanColumnComponent } from '../../components/kanban-column/kanban-column.component';
import { CardDetailModalComponent } from '../../components/card-detail-modal/card-detail-modal.component';
import { ActivitySidebarComponent } from '../../components/activity-sidebar/activity-sidebar.component';
import { LoadingSkeletonComponent } from '../../components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    BoardHeaderComponent,
    KanbanColumnComponent,
    CardDetailModalComponent,
    ActivitySidebarComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="h-screen flex flex-col bg-surface-100 dark:bg-surface-900 overflow-hidden">
      <!-- Board Header -->
      <app-board-header
        [title]="board()?.name ?? 'Cargando...'"
        [accentColor]="board()?.accentColor ?? '#6366F1'"
        [activityOpen]="activityOpen()"
        (toggleActivity)="activityOpen.set(!activityOpen())"
        (editBoard)="onEditBoard()"
        (deleteBoard)="onDeleteBoard()"
        (titleChange)="onTitleChange($event)"
      />

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex-1 flex items-center justify-center p-8">
          <div class="flex gap-4">
            @for (item of [1,2,3,4]; track item) {
              <div class="w-72 bg-surface-200 dark:bg-surface-800/50 rounded-xl animate-pulse p-4 space-y-3">
                <div class="h-5 bg-surface-300 dark:bg-surface-700 rounded w-2/3"></div>
                <div class="h-24 bg-surface-300 dark:bg-surface-700 rounded"></div>
                <div class="h-24 bg-surface-300 dark:bg-surface-700 rounded"></div>
                <div class="h-10 bg-surface-300 dark:bg-surface-700 rounded"></div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error state -->
      @if (error() && !loading()) {
        <div class="flex-1 flex items-center justify-center">
          <app-error-state
            [message]="error()!"
            (retry)="loadBoard()"
          />
        </div>
      }

      <!-- Board content -->
      @if (!loading() && !error()) {
        <div class="flex-1 flex overflow-x-auto p-4 gap-4 items-start">
          @for (col of sortedColumns(); track col.id) {
            <app-kanban-column
              [column]="col"
              [cards]="getCardsForColumn(col.id)"
              (cardClick)="onCardClick($event)"
              (deleteCol)="onDeleteColumn($event)"
              (renameCol)="onRenameColumn($event)"
              (cardCreated)="onCardCreated($event)"
              (cardMoved)="onCardMoved($event)"
            />
          }

          <!-- Add column button -->
          <div class="w-72 shrink-0">
            @if (!showAddColumn()) {
              <button
                (click)="showAddColumn.set(true)"
                class="w-full flex items-center gap-2 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 border-2 border-dashed border-border-200 dark:border-border-600 rounded-xl text-text-muted hover:text-text-primary hover:border-primary-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
                Añadir columna
              </button>
            } @else {
              <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 border border-border-200 dark:border-border-600">
                <div class="flex gap-1">
                  <input
                    #colInput
                    type="text"
                    [(ngModel)]="newColumnName"
                    (keydown.enter)="addColumn()"
                    (keydown.escape)="cancelAddColumn()"
                    placeholder="Nombre de la columna"
                    class="flex-1 px-2 py-1.5 text-sm border rounded bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button (click)="addColumn()" class="p-1.5 text-success-500 hover:text-success-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button (click)="cancelAddColumn()" class="p-1.5 text-text-muted hover:text-text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Card Detail Modal -->
      @if (selectedCard()) {
        <app-card-detail-modal
          [card]="selectedCard()!"
          [columns]="columnService.columns()"
          [activities]="[]"
          (close)="selectedCard.set(null)"
          (saved)="onCardSaved($event)"
          (deleted)="onCardDeleted($event)"
        />
      }

      <!-- Activity Sidebar -->
      <app-activity-sidebar
        [open]="activityOpen()"
        [activities]="activityService.activities()"
        (close)="activityOpen.set(false)"
      />
    </div>
  `,
})
export class BoardPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);
  columnService = inject(ColumnService);
  private cardService = inject(CardService);
  private sseService = inject(SseService);
  activityService = inject(ActivityService);
  private toast = inject(ToastService);

  readonly showAddColumn = signal(false);
  readonly newColumnName = signal('');
  readonly selectedCard = signal<Card | null>(null);
  readonly activityOpen = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly board = signal<Board | null>(null);

  boardId = '';

  sortedColumns = computed(() => {
    return [...this.columnService.columns()].sort(
      (a, b) => a.position - b.position
    );
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.boardId = id;
    this.loadBoard();
  }

  loadBoard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.boardService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.board.set(board);
        this.loading.set(false);
        this.columnService.fetchColumns(this.boardId);
        this.cardService.fetchCards(this.boardId);
        this.activityService.fetchActivities(this.boardId);
        this.sseService.connect(this.boardId);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar el tablero');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.sseService.disconnect();
  }

  getCardsForColumn(columnId: string): Card[] {
    return this.cardService
      .cards()
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  onTitleChange(newTitle: string): void {
    this.boardService
      .updateBoard(this.boardId, { name: newTitle })
      .subscribe({
        next: (board) => this.board.set(board),
        error: () => this.toast.error('Error al actualizar el nombre'),
      });
  }

  onEditBoard(): void {
    // Simplified - just rename via prompt
    const newName = prompt('Nuevo nombre del tablero:', this.board()?.name);
    if (newName && newName !== this.board()?.name) {
      this.onTitleChange(newName);
    }
  }

  onDeleteBoard(): void {
    if (!confirm('¿Estás seguro de eliminar este tablero? Se eliminarán todas las columnas y tarjetas.')) return;
    this.boardService.deleteBoard(this.boardId).subscribe({
      next: () => {
        this.toast.success('Tablero eliminado');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.toast.error('Error al eliminar el tablero'),
    });
  }

  addColumn(): void {
    const name = this.newColumnName();
    if (!name) return;
    this.columnService
      .createColumn({ boardId: this.boardId, name })
      .subscribe({
        next: () => {
          this.newColumnName.set('');
          this.showAddColumn.set(false);
        },
        error: () => this.toast.error('Error al crear columna'),
      });
  }

  cancelAddColumn(): void {
    this.newColumnName.set('');
    this.showAddColumn.set(false);
  }

  onDeleteColumn(id: string): void {
    if (!confirm('¿Eliminar esta columna y todas sus tarjetas?')) return;
    this.columnService.deleteColumn(id).subscribe({
      error: () => this.toast.error('Error al eliminar columna'),
    });
  }

  onRenameColumn(event: { id: string; name: string }): void {
    this.columnService.updateColumn(event.id, { name: event.name }).subscribe({
      error: () => this.toast.error('Error al renombrar columna'),
    });
  }

  onCardClick(card: Card): void {
    this.selectedCard.set(card);
  }

  onCardCreated(card: Card): void {
    // Card already added via service
  }

  onCardSaved(card: Card): void {
    this.selectedCard.set(null);
  }

  onCardDeleted(id: string): void {
    this.selectedCard.set(null);
  }

  onCardMoved(event: { cardId: string; targetColumnId: string; position: number }): void {
    // Optimistic update: move card locally
    this.cardService.cards.update((cards) => {
      const card = cards.find((c) => c.id === event.cardId);
      if (!card) return cards;
      return cards.map((c) =>
        c.id === event.cardId
          ? { ...c, columnId: event.targetColumnId, position: event.position }
          : c
      );
    });

    this.cardService
      .moveCard(event.cardId, event.targetColumnId, event.position)
      .subscribe({
        error: () => {
          // Revert on error by refetching
          this.toast.error('Error al mover tarjeta');
          this.cardService.fetchCards(this.boardId);
        },
      });
  }
}
