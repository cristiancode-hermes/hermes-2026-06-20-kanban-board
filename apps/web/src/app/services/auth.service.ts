import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api';

  private tokenSignal = signal<string | null>(localStorage.getItem('auth_token'));
  private currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  constructor() {
    if (this.tokenSignal()) {
      this.fetchCurrentUser();
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; user: User }>(`${this.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          this.tokenSignal.set(res.token);
          this.currentUserSignal.set(res.user);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<{ token: string; user: User }>(`${this.apiUrl}/auth/register`, {
        name,
        email,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          this.tokenSignal.set(res.token);
          this.currentUserSignal.set(res.user);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private fetchCurrentUser() {
    this.http
      .get<User>(`${this.apiUrl}/auth/me`)
      .pipe(catchError(() => of(null)))
      .subscribe((user) => {
        if (user) {
          this.currentUserSignal.set(user);
        } else {
          this.logout();
        }
      });
  }
}
