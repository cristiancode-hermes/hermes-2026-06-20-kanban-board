import { Component, input, output, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card, CardService } from '../../services/card.service';
import { Column } from '../../services/column.service';
import { ToastService } from '../../services/toast.service';

const LABEL_OPTIONS = [
  { key: 'red', label: 'Rojo', class: 'bg-label-red' },
  { key: 'yellow', label: 'Amarillo', class: 'bg-label-yellow' },
  { key: 'green', label: 'Verde', class: 'bg-label-green' },
  { key: 'blue', label: 'Azul', class: 'bg-label-blue' },
  { key: 'purple', label: 'Púrpura', class: 'bg-label-purple' },
  { key: 'pink', label: 'Rosa', class: 'bg-label-pink' },
];

@Component({
  selector: 'app-card-detail-modal',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div class="absolute inset-0 bg-black/50" (click)="close.emit()"></div>

      <div class="relative bg-surface-50 dark:bg-surface-800 rounded-xl shadow-2xl w-full max-w-lg p-6 mb-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-text-primary dark:text-text-inverted">Detalle de tarjeta</h2>
          <button (click)="close.emit()" class="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        @if (saving) {
          <div class="flex items-center justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        } @else {
          <!-- Form -->
          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Título</label>
              <input
                type="text"
                [(ngModel)]="editTitle"
                placeholder="Título de la tarjeta"
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
              <textarea
                [(ngModel)]="editDescription"
                rows="4"
                placeholder="Añade una descripción..."
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>

            <!-- Column select -->
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Columna</label>
              <select
                [(ngModel)]="editColumnId"
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                @for (col of columns(); track col.id) {
                  <option [value]="col.id">{{ col.name }}</option>
                }
              </select>
            </div>

            <!-- Assignee -->
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Asignado a</label>
              <input
                type="text"
                [(ngModel)]="editAssignee"
                placeholder="Nombre del responsable"
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <!-- Due date -->
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Fecha de vencimiento</label>
              <input
                type="date"
                [ngModel]="editDueDate"
                (ngModelChange)="editDueDate = $event"
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <!-- Labels -->
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Etiquetas</label>
              <div class="flex flex-wrap gap-2">
                @for (label of labelOptions; track label.key) {
                  <button
                    (click)="toggleLabel(label.key)"
                    class="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    [class]="label.class"
                    [class.opacity-30]="!editLabels.includes(label.key)"
                    [class.text-white]="editLabels.includes(label.key)"
                  >
                    {{ label.label }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Activity timeline -->
          @if (activities().length > 0) {
            <div class="mt-6 pt-4 border-t border-border-200 dark:border-border-600">
              <h3 class="text-sm font-semibold text-text-primary dark:text-text-inverted mb-3">Actividad</h3>
              <div class="space-y-3 max-h-48 overflow-y-auto">
                @for (activity of activities(); track activity.id) {
                  <div class="flex gap-3 text-sm">
                    <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                      {{ (activity.userName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-text-primary dark:text-text-inverted">
                        <span class="font-medium">{{ activity.userName }}</span>
                        {{ activity.action }}
                        <span class="italic">{{ activity.entityName }}</span>
                      </p>
                      <p class="text-text-muted text-xs mt-0.5">
                        {{ getRelativeTime(activity.timestamp) }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Actions -->
          <div class="flex justify-between mt-6 pt-4 border-t border-border-200 dark:border-border-600">
            <button
              (click)="onDelete()"
              class="px-4 py-2 text-sm font-medium text-danger-500 hover:text-danger-600 bg-danger-50 dark:bg-danger-500/10 rounded-lg transition-colors"
            >
              Eliminar tarjeta
            </button>
            <div class="flex gap-2">
              <button
                (click)="close.emit()"
                class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface-200 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                (click)="onSave()"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CardDetailModalComponent {
  private cardService = inject(CardService);
  private toast = inject(ToastService);

  readonly card = input.required<Card>();
  readonly columns = input.required<Column[]>();
  readonly activities = input<any[]>([]);
  readonly close = output<void>();
  readonly saved = output<Card>();
  readonly deleted = output<string>();

  saving = false;
  editTitle = '';
  editDescription = '';
  editColumnId = '';
  editAssignee = '';
  editDueDate = '';
  editLabels: string[] = [];
  labelOptions = LABEL_OPTIONS;

  constructor() {
    // Initialize from card input
    setTimeout(() => this.resetForm());
  }

  private resetForm(): void {
    const card = this.card();
    this.editTitle = card.title;
    this.editDescription = card.description || '';
    this.editColumnId = card.columnId;
    this.editAssignee = card.assignee || '';
    this.editDueDate = card.dueDate || '';
    this.editLabels = card.labels || [];
  }

  toggleLabel(key: string): void {
    if (this.editLabels.includes(key)) {
      this.editLabels = this.editLabels.filter((l) => l !== key);
    } else {
      this.editLabels = [...this.editLabels, key];
    }
  }

  onSave(): void {
    if (!this.editTitle) return;
    this.saving = true;
    this.cardService
      .updateCard(this.card().id, {
        title: this.editTitle,
        description: this.editDescription || undefined,
        columnId: this.editColumnId,
        assignee: this.editAssignee || undefined,
        dueDate: this.editDueDate || undefined,
        labels: this.editLabels,
      })
      .subscribe({
        next: (card) => {
          this.saving = false;
          this.toast.success('Tarjeta actualizada');
          this.saved.emit(card);
        },
        error: () => {
          this.saving = false;
          this.toast.error('Error al guardar la tarjeta');
        },
      });
  }

  onDelete(): void {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;
    this.cardService.deleteCard(this.card().id).subscribe({
      next: () => {
        this.toast.success('Tarjeta eliminada');
        this.deleted.emit(this.card().id);
        this.close.emit();
      },
      error: () => {
        this.toast.error('Error al eliminar la tarjeta');
      },
    });
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
