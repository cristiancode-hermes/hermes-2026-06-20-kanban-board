import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900 p-4">
      <div class="text-center max-w-md">
        <h1 class="text-8xl font-bold text-primary-500">404</h1>
        <h2 class="text-2xl font-semibold text-text-primary dark:text-text-inverted mt-4">
          Página no encontrada
        </h2>
        <p class="text-text-secondary mt-2">
          La página que buscas no existe o ha sido movida.
        </p>
        <a
          routerLink="/dashboard"
          class="inline-block mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  `,
})
export class NotFoundPageComponent {}
