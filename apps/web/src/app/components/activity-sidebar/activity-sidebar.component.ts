import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityItem } from '../../services/activity.service';

@Component({
  selector: 'app-activity-sidebar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div
      class="fixed right-0 top-0 h-full w-80 bg-surface-50 dark:bg-surface-800 shadow-2xl border-l border-border-200 dark:border-border-600 z-40 flex flex-col transition-transform"
      [class.translate-x-0]="open()"
      [class.translate-x-full]="!open()"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border-200 dark:border-border-600">
        <h2 class="text-lg font-semibold text-text-primary dark:text-text-inverted">Actividad</h2>
        <button
          (click)="close.emit()"
          class="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-text-muted"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Filter -->
      <div class="px-4 py-2 border-b border-border-200 dark:border-border-600">
        <select
          [(ngModel)]="filter"
          class="w-full px-2 py-1.5 text-sm border rounded bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las acciones</option>
          <option value="creó">Creaciones</option>
          <option value="movió">Movimientos</option>
          <option value="actualizó">Actualizaciones</option>
          <option value="eliminó">Eliminaciones</option>
        </select>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        @if (filteredActivities().length === 0) {
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="mt-3 text-sm text-text-muted">Aún no hay actividad</p>
          </div>
        }

        @for (item of filteredActivities(); track item.id) {
          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
              {{ (item.userName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm text-text-primary dark:text-text-inverted">
                <span class="font-medium">{{ item.userName }}</span>
                {{ item.action }}
                <span class="italic text-text-secondary">{{ item.entityName }}</span>
              </p>
              <p class="text-xs text-text-muted mt-0.5">{{ getRelativeTime(item.timestamp) }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ActivitySidebarComponent {
  readonly open = input(false);
  readonly activities = input<ActivityItem[]>([]);
  readonly close = output<void>();

  filter = '';

  filteredActivities(): ActivityItem[] {
    if (!this.filter) return this.activities();
    return this.activities().filter((a) => a.action.includes(this.filter));
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'ahora mismo';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES');
  }
}
