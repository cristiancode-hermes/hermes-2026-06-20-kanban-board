import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-200 dark:bg-surface-900 p-4">
      <div class="w-full max-w-md">
        <div class="bg-surface-50 dark:bg-surface-800 rounded-xl shadow-lg overflow-hidden">
          <!-- Header -->
          <div class="p-6 pb-0">
            <h1 class="text-2xl font-bold text-center text-text-primary dark:text-text-inverted">
              Kanban Board
            </h1>
            <p class="text-center text-text-secondary mt-1">Inicia sesión en tu cuenta</p>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-border-200 dark:border-border-600 mx-6 mt-4">
            <button
              class="flex-1 pb-3 text-sm font-medium border-b-2 transition-colors"
              [class.text-primary-500]="activeTab === 'login'"
              [class.border-primary-500]="activeTab === 'login'"
              [class.text-text-muted]="activeTab !== 'login'"
              [class.border-transparent]="activeTab !== 'login'"
              (click)="activeTab = 'login'"
            >
              Iniciar Sesión
            </button>
            <button
              class="flex-1 pb-3 text-sm font-medium border-b-2 transition-colors"
              [class.text-primary-500]="activeTab === 'register'"
              [class.border-primary-500]="activeTab === 'register'"
              [class.text-text-muted]="activeTab !== 'register'"
              [class.border-transparent]="activeTab !== 'register'"
              routerLink="/register"
            >
              Registrarse
            </button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Correo electrónico</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="tu@correo.com"
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                [class.border-danger-500]="error"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••"
                class="w-full px-3 py-2 border rounded-lg bg-surface-50 dark:bg-surface-700 border-border-200 dark:border-border-600 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                [class.border-danger-500]="error"
              />
            </div>

            @if (error) {
              <div class="p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-500 rounded-lg text-danger-500 text-sm">
                {{ error }}
              </div>
            }

            <button
              type="submit"
              disabled="{{ loading }}"
              class="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              @if (loading) {
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              } @else {
                Iniciar Sesión
              }
            </button>

            <p class="text-center text-sm text-text-secondary">
              ¿No tienes cuenta?
              <a routerLink="/register" class="text-primary-500 hover:text-primary-600 font-medium">Regístrate</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  activeTab = 'login';
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }
    this.loading = true;
    this.error = null;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.success('Sesión iniciada correctamente');
      },
      error: (err) => {
        this.error = err.error?.message || 'Credenciales inválidas';
        this.loading = false;
      },
    });
  }
}
