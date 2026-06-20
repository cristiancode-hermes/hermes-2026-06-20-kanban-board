import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface SseEvent {
  type: 'card:created' | 'card:updated' | 'card:moved' | 'card:deleted' | 'column:created';
  data: any;
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private auth = inject(AuthService);
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000;
  private currentBoardId: string | null = null;

  readonly connected = signal<'connected' | 'connecting' | 'disconnected'>('disconnected');
  readonly events = signal<SseEvent[]>([]);

  connect(boardId: string): void {
    this.disconnect();
    this.currentBoardId = boardId;
    this.connected.set('connecting');
    this.reconnectAttempts = 0;

    const token = this.auth.getToken();
    const url = `/api/sse/board/${boardId}?token=${token}`;

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.connected.set('connected');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as SseEvent;
        this.events.update((list) => [...list.slice(-50), parsed]);
      } catch {
        // ignore malformed events
      }
    };

    this.eventSource.onerror = () => {
      this.connected.set('disconnected');
      this.eventSource?.close();
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      !this.currentBoardId
    ) {
      this.connected.set('disconnected');
      return;
    }

    this.reconnectAttempts++;
    this.connected.set('connecting');

    setTimeout(() => {
      if (this.currentBoardId) {
        this.connect(this.currentBoardId);
      }
    }, this.reconnectInterval);
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this.connected.set('disconnected');
    this.currentBoardId = null;
    this.reconnectAttempts = 0;
  }
}
