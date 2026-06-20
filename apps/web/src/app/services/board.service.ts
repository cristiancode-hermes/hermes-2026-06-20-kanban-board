import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface Board {
  id: string;
  name: string;
  description?: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
  cardCount?: number;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private http = inject(HttpClient);
  private apiUrl = '/api/boards';

  readonly boards = signal<Board[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchBoards(): Observable<Board[]> {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.http.get<Board[]>(this.apiUrl);
    obs.subscribe({
      next: (boards) => {
        this.boards.set(boards);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar tableros');
        this.loading.set(false);
      },
    });
    return obs;
  }

  getBoard(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${id}`);
  }

  createBoard(data: { name: string; description?: string; accentColor: string }): Observable<Board> {
    const obs = this.http.post<Board>(this.apiUrl, data);
    obs.subscribe((board) => {
      this.boards.update((list) => [...list, board]);
    });
    return obs;
  }

  updateBoard(id: string, data: Partial<Board>): Observable<Board> {
    const obs = this.http.put<Board>(`${this.apiUrl}/${id}`, data);
    obs.subscribe((board) => {
      this.boards.update((list) => list.map((b) => (b.id === id ? board : b)));
    });
    return obs;
  }

  deleteBoard(id: string): Observable<void> {
    const obs = this.http.delete<void>(`${this.apiUrl}/${id}`);
    obs.subscribe(() => {
      this.boards.update((list) => list.filter((b) => b.id !== id));
    });
    return obs;
  }
}
