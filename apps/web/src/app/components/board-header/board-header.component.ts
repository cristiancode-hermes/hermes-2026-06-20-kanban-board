import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';
import { SseStatusComponent } from '../sse-status/sse-status.component';

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [RouterLink, FormsModule, SseStatusComponent],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-surface-800 border-b border-border-200 dark:border-border-600">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Back button -->
        <a
          routerLink="/dashboard"
          class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
        </a>

        <!-- Accent color indicator -->
        <div
          class="w-3 h-3 rounded-full shrink-0"
          [style.background-color]="accentColor()"
        ></div>

        <!-- Editable title -->
        @if (!editing) {
          <div class="flex items-center gap-2 min-w-0">
            <h1
              class="text-lg font-semibold text-text-primary dark:text-text-inverted truncate cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 px-2 py-0.5 rounded transition-colors"
              (click)="startEditing()"
            >
              {{ title() }}
            </h1>
            <button
              (click)="startEditing()"
              class="p-1 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
          </div>
        } @else {
          <div class="flex items-center gap-2">
            <input
              #titleInput
              type="text"
              [(ngModel)]="editTitle"
              (keydown.enter)="saveTitle()"
              (keydown.escape)="cancelEditing()"
              (blur)="saveTitle()"
              class="px-2 py-1 border rounded bg-surface-50 dark:bg-surface-700 border-primary-500 text-text-primary text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button (click)="saveTitle()" class="p-1 text-success-500 hover:text-success-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
            <button (click)="cancelEditing()" class="p-1 text-text-muted hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        }
      </div>

      <div class="flex items-center gap-3">
        <app-sse-status />

        <!-- Activity toggle -->
        <button
          (click)="toggleActivity.emit()"
          class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          [class.text-primary-500]="activityOpen()"
          title="Actividad"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
          </svg>
        </button>

        <!-- Board actions -->
        <div class="relative">
          <button
            (click)="showMenu = !showMenu"
            class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </button>
          @if (showMenu) {
            <div class="absolute right-0 mt-1 w-40 bg-surface-50 dark:bg-surface-800 rounded-lg shadow-lg border border-border-200 dark:border-border-600 py-1 z-50">
              <button
                (click)="showMenu = false; editBoard.emit()"
                class="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                Editar tablero
              </button>
              <button
                (click)="showMenu = false; deleteBoard.emit()"
                class="w-full text-left px-4 py-2 text-sm text-danger-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                Eliminar tablero
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  host: { class: 'group' },
})
export class BoardHeaderComponent {
  private boardService = inject(BoardService);

  readonly title = input.required<string>();
  readonly accentColor = input.required<string>();
  readonly activityOpen = input(false);
  readonly toggleActivity = output<void>();
  readonly editBoard = output<void>();
  readonly deleteBoard = output<void>();
  readonly titleChange = output<string>();

  editing = false;
  editTitle = '';
  showMenu = false;

  startEditing(): void {
    this.editTitle = this.title();
    this.editing = true;
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="text"]');
      el?.focus();
      el?.select();
    });
  }

  saveTitle(): void {
    if (this.editTitle && this.editTitle !== this.title()) {
      this.titleChange.emit(this.editTitle);
    }
    this.editing = false;
  }

  cancelEditing(): void {
    this.editing = false;
  }
}
