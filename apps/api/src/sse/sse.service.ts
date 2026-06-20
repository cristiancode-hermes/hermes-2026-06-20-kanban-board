import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface SseEvent {
  type: string;
  data: any;
  boardId: number;
}

@Injectable()
export class SseService {
  private subjects = new Map<number, Subject<SseEvent>>();

  private getSubject(boardId: number): Subject<SseEvent> {
    if (!this.subjects.has(boardId)) {
      this.subjects.set(boardId, new Subject<SseEvent>());
    }
    return this.subjects.get(boardId)!;
  }

  emit(boardId: number, event: { type: string; data: any }) {
    this.getSubject(boardId).next({ ...event, boardId });
  }

  getObservable(boardId: number): Observable<MessageEvent> {
    return this.getSubject(boardId).pipe(
      filter((event) => event.boardId === boardId),
      map(
        (event) =>
          ({
            type: event.type,
            data: JSON.stringify(event.data),
          }) as MessageEvent,
      ),
    );
  }
}
