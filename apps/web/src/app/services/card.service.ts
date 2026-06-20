import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Card {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  position: number;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private apiUrl = '/api/cards';

  readonly cards = signal<Card[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchCards(boardId: string): Observable<Card[]> {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.http.get<Card[]>(`${this.apiUrl}?boardId=${boardId}`);
    obs.subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar tarjetas');
        this.loading.set(false);
      },
    });
    return obs;
  }

  createCard(data: {
    columnId: string;
    boardId: string;
    title: string;
  }): Observable<Card> {
    const obs = this.http.post<Card>(this.apiUrl, data);
    obs.subscribe((card) => {
      this.cards.update((list) => [...list, card]);
    });
    return obs;
  }

  updateCard(id: string, data: Partial<Card>): Observable<Card> {
    const obs = this.http.put<Card>(`${this.apiUrl}/${id}`, data);
    obs.subscribe((card) => {
      this.cards.update((list) => list.map((c) => (c.id === id ? card : c)));
    });
    return obs;
  }

  deleteCard(id: string): Observable<void> {
    const obs = this.http.delete<void>(`${this.apiUrl}/${id}`);
    obs.subscribe(() => {
      this.cards.update((list) => list.filter((c) => c.id !== id));
    });
    return obs;
  }

  moveCard(
    cardId: string,
    targetColumnId: string,
    position: number
  ): Observable<Card> {
    const obs = this.http.put<Card>(`${this.apiUrl}/${cardId}/move`, {
      columnId: targetColumnId,
      position,
    });
    obs.subscribe((card) => {
      this.cards.update((list) =>
        list.map((c) => (c.id === cardId ? card : c))
      );
    });
    return obs;
  }
}
