import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="bg-surface-50 dark:bg-surface-800 border-b border-border-200 dark:border-border-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2 text-xl font-bold text-text-primary dark:text-text-inverted">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
            </svg>
            Kanban Board
          </a>

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Theme toggle -->
            <button
              (click)="theme.toggle()"
              class="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              [attr.aria-label]="theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
            >
              @if (theme.isDark()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              }
            </button>

            <!-- User menu -->
            <div class="relative" (click)="showUserMenu = !showUserMenu">
              <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                  {{ (auth.currentUser()?.name ?? 'U').charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-text-primary dark:text-text-inverted hidden sm:block">
                  {{ auth.currentUser()?.name ?? 'Usuario' }}
                </span>
              </button>

              @if (showUserMenu) {
                <div class="absolute right-0 mt-2 w-48 bg-surface-50 dark:bg-surface-800 rounded-lg shadow-lg border border-border-200 dark:border-border-600 py-1 z-50">
                  <div class="px-4 py-2 border-b border-border-200 dark:border-border-600">
                    <p class="text-sm font-medium text-text-primary dark:text-text-inverted">{{ auth.currentUser()?.name }}</p>
                    <p class="text-xs text-text-muted">{{ auth.currentUser()?.email }}</p>
                  </div>
                  <button
                    (click)="auth.logout()"
                    class="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-danger-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  showUserMenu = false;
}
