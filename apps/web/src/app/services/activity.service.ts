import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActivityItem {
  id: string;
  boardId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityName: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = '/api/activities';

  readonly activities = signal<ActivityItem[]>([]);
  readonly loading = signal(false);

  fetchActivities(boardId: string): Observable<ActivityItem[]> {
    this.loading.set(true);
    const obs = this.http.get<ActivityItem[]>(
      `${this.apiUrl}?boardId=${boardId}`
    );
    obs.subscribe({
      next: (items) => {
        this.activities.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
    return obs;
  }
}
