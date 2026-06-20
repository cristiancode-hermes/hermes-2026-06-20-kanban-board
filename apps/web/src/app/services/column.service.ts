import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  cardCount?: number;
}

@Injectable({ providedIn: 'root' })
export class ColumnService {
  private http = inject(HttpClient);
  private apiUrl = '/api/columns';

  readonly columns = signal<Column[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchColumns(boardId: string): Observable<Column[]> {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.http.get<Column[]>(`${this.apiUrl}?boardId=${boardId}`);
    obs.subscribe({
      next: (cols) => {
        this.columns.set(cols);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar columnas');
        this.loading.set(false);
      },
    });
    return obs;
  }

  createColumn(data: { boardId: string; name: string }): Observable<Column> {
    const obs = this.http.post<Column>(this.apiUrl, data);
    obs.subscribe((col) => {
      this.columns.update((list) => [...list, col]);
    });
    return obs;
  }

  updateColumn(id: string, data: Partial<Column>): Observable<Column> {
    const obs = this.http.put<Column>(`${this.apiUrl}/${id}`, data);
    obs.subscribe((col) => {
      this.columns.update((list) => list.map((c) => (c.id === id ? col : c)));
    });
    return obs;
  }

  deleteColumn(id: string): Observable<void> {
    const obs = this.http.delete<void>(`${this.apiUrl}/${id}`);
    obs.subscribe(() => {
      this.columns.update((list) => list.filter((c) => c.id !== id));
    });
    return obs;
  }

  reorderColumns(boardId: string, columnIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, { boardId, columnIds });
  }
}
