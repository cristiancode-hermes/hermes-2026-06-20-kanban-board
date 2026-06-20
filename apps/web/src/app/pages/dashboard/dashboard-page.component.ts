import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { HeaderComponent } from '../../components/header/header.component';
import { CreateBoardModalComponent } from '../../components/create-board-modal/create-board-modal.component';
import { LoadingSkeletonComponent } from '../../components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    HeaderComponent,
    CreateBoardModalComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="min-h-screen bg-surface-100 dark:bg-surface-900">
      <app-header />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-text-primary dark:text-text-inverted">Mis Tableros</h1>
            <p class="text-text-secondary mt-1">Gestiona tus proyectos con Kanban</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Sort -->
            <select
              [(ngModel)]="sortBy"
              class="px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="updated">Más recientes</option>
              <option value="name">Nombre</option>
              <option value="created">Fecha creación</option>
            </select>
            <button
              (click)="showCreateModal = true"
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Nuevo Tablero
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="relative mb-6">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar tableros..."
            class="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Loading state -->
        @if (boardService.loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of [1,2,3,4,5,6]; track item) {
              <app-loading-skeleton />
            }
          </div>
        }

        <!-- Error state -->
        @if (boardService.error(); as err) {
          <app-error-state
            [message]="err"
            (retry)="boardService.fetchBoards()"
          />
        }

        <!-- Empty state -->
        @if (!boardService.loading() && !boardService.error() && filteredBoards().length === 0 && !searchQuery) {
          <app-empty-state
            title="Crea tu primer tablero"
            description="Organiza tus proyectos con el método Kanban. Crea columnas, añade tarjetas y gestiona tu flujo de trabajo."
            actionLabel="Crear Tablero"
            (action)="showCreateModal = true"
          />
        }

        <!-- No results -->
        @if (!boardService.loading() && !boardService.error() && filteredBoards().length === 0 && searchQuery) {
          <div class="text-center py-16">
            <p class="text-text-muted text-lg">No se encontraron tableros para "{{ searchQuery }}"</p>
          </div>
        }

        <!-- Board grid -->
        @if (!boardService.loading() && !boardService.error() && filteredBoards().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (board of filteredBoards(); track board.id) {
              <a
                [routerLink]="['/board', board.id]"
                class="block bg-surface-50 dark:bg-surface-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div class="h-2" [style.background-color]="board.accentColor"></div>
                <div class="p-5">
                  <h3 class="font-semibold text-text-primary dark:text-text-inverted group-hover:text-primary-500 transition-colors">
                    {{ board.name }}
                  </h3>
                  @if (board.description) {
                    <p class="text-text-secondary text-sm mt-1 line-clamp-2">{{ board.description }}</p>
                  }
                  <div class="flex items-center gap-4 mt-4 text-sm text-text-muted">
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                      </svg>
                      {{ board.cardCount ?? 0 }} tarjetas
                    </span>
                    <span>{{ board.updatedAt | date:'shortDate' }}</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </main>

      @if (showCreateModal) {
        <app-create-board-modal
          (close)="showCreateModal = false"
          (created)="onBoardCreated($event)"
        />
      }
    </div>
  `,
})
export class DashboardPageComponent {
  boardService = inject(BoardService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  showCreateModal = false;
  searchQuery = '';
  sortBy = 'updated';

  filteredBoards = computed(() => {
    let boards = this.boardService.boards();
    const query = this.searchQuery.toLowerCase();

    if (query) {
      boards = boards.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query))
      );
    }

    switch (this.sortBy) {
      case 'name':
        return [...boards].sort((a, b) => a.name.localeCompare(b.name));
      case 'created':
        return [...boards].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'updated':
      default:
        return [...boards].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  constructor() {
    this.boardService.fetchBoards();
  }

  onBoardCreated(board: any): void {
    this.showCreateModal = false;
    this.toast.success(`Tablero "${board.name}" creado`);
  }
}
