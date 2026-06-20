import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="text-center py-12 px-4">
      <svg class="mx-auto h-12 w-12 text-danger-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-text-primary dark:text-text-inverted">Algo salió mal</h3>
      <p class="mt-2 text-text-secondary">{{ message() }}</p>
      <button
        (click)="retry.emit()"
        class="mt-4 px-4 py-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-500/10 rounded-lg transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input('Ha ocurrido un error inesperado');
  readonly retry = output<void>();
}
