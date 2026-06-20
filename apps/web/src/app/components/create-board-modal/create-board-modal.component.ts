import { Component, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';

const BOARD_COLORS = [
  { value: '#3B82F6', class: 'bg-board-blue' },
  { value: '#10B981', class: 'bg-board-emerald' },
  { value: '#8B5CF6', class: 'bg-board-purple' },
  { value: '#F59E0B', class: 'bg-board-amber' },
  { value: '#F43F5E', class: 'bg-board-rose' },
  { value: '#06B6D4', class: 'bg-board-cyan' },
];

@Component({
  selector: 'app-create-board-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" (click)="close.emit()"></div>

      <!-- Modal -->
      <div class="relative bg-surface-50 dark:bg-surface-800 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-text-primary dark:text-text-inverted">Crear Nuevo Tablero</h2>
          <button (click)="close.emit()" class="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1">Nombre del tablero</label>
            <input
              type="text"
              [(ngModel)]="name"
              placeholder="Ej: Proyecto Alpha"
              class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1">Descripción (opcional)</label>
            <textarea
              [(ngModel)]="description"
              rows="3"
              placeholder="Describe el propósito del tablero..."
              class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Color de acento</label>
            <div class="flex gap-3">
              @for (color of colors; track color.value) {
                <button
                  (click)="selectedColor = color.value"
                  class="w-8 h-8 rounded-full transition-transform"
                  [class]="color.class"
                  [class.ring-2]="selectedColor === color.value"
                  [class.ring-offset-2]="selectedColor === color.value"
                  [class.ring-primary-500]="selectedColor === color.value"
                ></button>
              }
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            (click)="close.emit()"
            class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface-200 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="onCreate()"
            [disabled]="!name || loading"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            @if (loading) {
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando...
            } @else {
              Crear Tablero
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CreateBoardModalComponent {
  private boardService = inject(BoardService);

  close = output<void>();
  created = output<any>();

  colors = BOARD_COLORS;
  name = '';
  description = '';
  selectedColor = BOARD_COLORS[0].value;
  loading = false;

  onCreate(): void {
    if (!this.name) return;
    this.loading = true;
    this.boardService
      .createBoard({
        name: this.name,
        description: this.description || undefined,
        accentColor: this.selectedColor,
      })
      .subscribe({
        next: (board) => {
          this.created.emit(board);
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
