import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Card } from '../../services/card.service';

const LABEL_COLORS: Record<string, string> = {
  red: 'bg-label-red',
  yellow: 'bg-label-yellow',
  green: 'bg-label-green',
  blue: 'bg-label-blue',
  purple: 'bg-label-purple',
  pink: 'bg-label-pink',
};

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div
      class="bg-surface-50 dark:bg-surface-700 rounded-lg shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border border-border-200 dark:border-border-600"
      draggable="true"
      (dragstart)="onDragStart($event)"
      (dragend)="onDragEnd($event)"
    >
      <!-- Labels -->
      @if (card().labels && card().labels!.length > 0) {
        <div class="flex flex-wrap gap-1 mb-2">
          @for (label of card().labels; track label) {
            <span
              class="inline-block w-8 h-1.5 rounded-full"
              [class]="labelColorClass(label)"
            ></span>
          }
        </div>
      }

      <!-- Title -->
      <h3 class="text-sm font-medium text-text-primary dark:text-text-inverted">
        {{ card().title }}
      </h3>

      <!-- Meta -->
      <div class="flex items-center gap-3 mt-2 text-xs text-text-muted">
        @if (card().dueDate) {
          <span class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clip-rule="evenodd"/>
            </svg>
            {{ card().dueDate | date:'shortDate' }}
          </span>
        }

        @if (card().assignee) {
          <span class="flex items-center gap-1 ml-auto">
            <span class="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-medium">
              {{ card().assignee!.charAt(0).toUpperCase() }}
            </span>
          </span>
        }
      </div>
    </div>
  `,
})
export class KanbanCardComponent {
  readonly card = input.required<Card>();
  readonly cardClick = output<Card>();
  readonly dragStart = output<{ card: Card; event: DragEvent }>();
  readonly dragEnd = output<void>();

  labelColorClass(label: string): string {
    return LABEL_COLORS[label] || 'bg-text-muted';
  }

  onDragStart(event: DragEvent): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      cardId: this.card().id,
      columnId: this.card().columnId,
    }));
    const el = event.target as HTMLElement;
    el.classList.add('shadow-xl', 'rotate-3', 'opacity-50');
    this.dragStart.emit({ card: this.card(), event });
  }

  onDragEnd(event: DragEvent): void {
    const el = event.target as HTMLElement;
    el.classList.remove('shadow-xl', 'rotate-3', 'opacity-50');
    this.dragEnd.emit();
  }
}
