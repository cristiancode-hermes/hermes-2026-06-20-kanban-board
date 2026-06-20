import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="text-center py-16 px-4">
      <svg class="mx-auto h-16 w-16 text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-text-primary dark:text-text-inverted">{{ title() }}</h3>
      <p class="mt-2 text-text-secondary max-w-sm mx-auto">{{ description() }}</p>
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="mt-6 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('Sin contenido');
  readonly description = input('');
  readonly actionLabel = input<string | undefined>(undefined);
  readonly action = output<void>();
}
