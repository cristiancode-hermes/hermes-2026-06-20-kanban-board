import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  remove(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private add(message: string, type: Toast['type']): void {
    const id = crypto.randomUUID();
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.remove(id), 4000);
  }
}
