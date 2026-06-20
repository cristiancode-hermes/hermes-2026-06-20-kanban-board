import { Component, inject } from '@angular/core';
import { SseService } from '../../services/sse.service';

@Component({
  selector: 'app-sse-status',
  standalone: true,
  template: `
    <div class="flex items-center gap-1.5" [title]="statusLabel()">
      <span
        class="h-2.5 w-2.5 rounded-full"
        [class.bg-success-500]="sseService.connected() === 'connected'"
        [class.bg-warning-500]="sseService.connected() === 'connecting'"
        [class.bg-danger-500]="sseService.connected() === 'disconnected'"
      ></span>
      <span class="text-xs text-text-muted">{{ statusLabel() }}</span>
    </div>
  `,
})
export class SseStatusComponent {
  sseService = inject(SseService);

  statusLabel(): string {
    switch (this.sseService.connected()) {
      case 'connected':
        return 'En vivo';
      case 'connecting':
        return 'Reconectando...';
      case 'disconnected':
        return 'Desconectado';
    }
  }
}
