import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationItem {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  read: boolean;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count?userId=${userId}`);
  }

  listByUser(userId: number, page = 0, size = 5) {
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}&page=${page}&size=${size}`);
  }

  markAsRead(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/read`, {});
  }

  // Attempt to open an SSE stream for real-time notifications.
  // Note: EventSource cannot send custom headers. If your backend requires
  // Authorization headers, provide a token query param handling on the server.
  listen(userId: number): Observable<NotificationItem> {
    return new Observable<NotificationItem>(subscriber => {
      const token = localStorage.getItem('token');
      let url = `${this.apiUrl}/stream?userId=${userId}`;
      if (token) {
        url += `&token=${encodeURIComponent(token)}`;
      }

      const es = new EventSource(url);

      es.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          subscriber.next(data as NotificationItem);
        } catch (err) {
          // ignore malformed messages
        }
      };

      es.onerror = (err) => {
        subscriber.error(err);
        es.close();
      };

      return () => es.close();
    });
  }
}
