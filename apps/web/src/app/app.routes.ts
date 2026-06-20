import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register-page.component').then(
        (m) => m.RegisterPageComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'board/:id',
    loadComponent: () =>
      import('./pages/board/board-page.component').then(
        (m) => m.BoardPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      ),
  },
];
