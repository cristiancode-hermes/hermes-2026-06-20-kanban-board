import { Component, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';
import { CardService, Card } from '../../services/card.service';
import { Column } from '../../services/column.service';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [DatePipe, FormsModule, KanbanCardComponent],
  template: `
    <div
      class="flex flex-col bg-surface-200 dark:bg-surface-800/50 rounded-xl w-72 min-w-72 max-h-full"
      (dragover)="onDragOver($event)"
      (dragenter)="onDragEnter($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      [class.ring-2]="isDragOver"
      [class.ring-primary-500]="isDragOver"
      [class.bg-primary-50]="isDragOver"
      [class.dark:bg-primary-500/10]="isDragOver"
    >
      <!-- Column header -->
      <div class="flex items-center justify-between px-3 py-3">
        <div class="flex items-center gap-2 min-w-0">
          <h3 class="text-sm font-semibold text-text-primary dark:text-text-inverted truncate">
            {{ column().name }}
          </h3>
          <span class="text-xs font-medium text-text-muted bg-surface-300 dark:bg-surface-700 px-1.5 py-0.5 rounded-full">
            {{ cards().length }}
          </span>
        </div>

        <!-- Column menu -->
        <div class="relative">
          <button
            (click)="showMenu = !showMenu"
            class="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </button>
          @if (showMenu) {
            <div class="absolute right-0 top-full mt-1 w-32 bg-surface-50 dark:bg-surface-800 rounded-lg shadow-lg border border-border-200 dark:border-border-600 py-1 z-40">
              <button
                (click)="showMenu = false; startRename()"
                class="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                Renombrar
              </button>
              <button
                (click)="showMenu = false; deleteCol.emit(column().id)"
                class="w-full text-left px-3 py-1.5 text-sm text-danger-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Rename input -->
      @if (renaming) {
        <div class="px-3 pb-2">
          <div class="flex gap-1">
            <input
              type="text"
              [(ngModel)]="renameValue"
              (keydown.enter)="saveRename()"
              (keydown.escape)="renaming = false"
              (blur)="saveRename()"
              class="flex-1 px-2 py-1 text-sm border rounded bg-surface-50 dark:bg-surface-700 border-primary-500 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      }

      <!-- Card list (droppable) -->
      <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[60px]">
        @for (card of cards(); track card.id) {
          <app-kanban-card
            [card]="card"
            (cardClick)="cardClick.emit(card)"
          />
        }

        @if (cards().length === 0) {
          <div class="flex items-center justify-center h-20 text-xs text-text-muted border-2 border-dashed border-border-200 dark:border-border-600 rounded-lg">
            Arrastra tarjetas aquí
          </div>
        }
      </div>

      <!-- Quick add card -->
      <div class="px-3 py-2 border-t border-border-200 dark:border-border-600">
        @if (!showAddCard) {
          <button
            (click)="showAddCard = true"
            class="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-300 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Añadir tarjeta
          </button>
        } @else {
          <div class="flex gap-1">
            <input
              type="text"
              [(ngModel)]="newCardTitle"
              (keydown.enter)="addCard()"
              (keydown.escape)="cancelAdd()"
              placeholder="Título de la tarjeta..."
              class="flex-1 px-2 py-1 text-sm border rounded bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
              #addCardInput
              autofocus
            />
            <button
              (click)="addCard()"
              class="p-1 text-success-500 hover:text-success-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
            <button (click)="cancelAdd()" class="p-1 text-text-muted hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class KanbanColumnComponent {
  private cardService = inject(CardService);

  readonly column = input.required<Column>();
  readonly cards = input.required<Card[]>();
  readonly cardClick = output<Card>();
  readonly deleteCol = output<string>();
  readonly renameCol = output<{ id: string; name: string }>();
  readonly cardCreated = output<Card>();
  readonly cardMoved = output<{ cardId: string; targetColumnId: string; position: number }>();

  showMenu = false;
  renaming = false;
  renameValue = '';
  showAddCard = false;
  newCardTitle = '';
  isDragOver = false;

  startRename(): void {
    this.renameValue = this.column().name;
    this.renaming = true;
  }

  saveRename(): void {
    if (this.renameValue && this.renameValue !== this.column().name) {
      this.renameCol.emit({ id: this.column().id, name: this.renameValue });
    }
    this.renaming = false;
  }

  addCard(): void {
    if (!this.newCardTitle) return;
    this.cardService
      .createCard({
        columnId: this.column().id,
        boardId: this.column().boardId,
        title: this.newCardTitle,
      })
      .subscribe({
        next: (card) => {
          this.cardCreated.emit(card);
          this.newCardTitle = '';
          this.showAddCard = false;
        },
      });
  }

  cancelAdd(): void {
    this.newCardTitle = '';
    this.showAddCard = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement;
    if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
      this.isDragOver = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    try {
      const data = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}');
      if (data.cardId && data.columnId !== this.column().id) {
        this.cardMoved.emit({
          cardId: data.cardId,
          targetColumnId: this.column().id,
          position: this.cards().length,
        });
      }
    } catch {}
  }
}
