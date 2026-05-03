import { Injectable } from '@angular/core';
import { BASE_URL } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  async getMyNotifications(): Promise<AppNotification[]> {
    const data = await fetchJson<unknown>(`${BASE_URL}/api/Notification/my`);
    return this.normalizeList(data);
  }

  async getUnreadCount(): Promise<number> {
    const data = await fetchJson<unknown>(`${BASE_URL}/api/Notification/count`);
    return typeof data === 'number' ? data : 0;
  }

  async markRead(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Notification/read/${id}`, { method: 'POST' });
  }

  async markAllRead(): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Notification/read-all`, { method: 'POST' });
  }

  private normalizeList(data: unknown): AppNotification[] {
    let list: unknown[];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && typeof data === 'object') {
      const wrapped = data as Record<string, unknown>;
      const values = wrapped['$values'] ?? wrapped['values'] ?? wrapped['Items'] ?? wrapped['items'];
      list = Array.isArray(values) ? values : [];
    } else {
      list = [];
    }

    return list.map(item => {
      const n = item as Record<string, unknown>;
      return {
        id: Number(n['id'] ?? n['Id'] ?? 0),
        title: String(n['title'] ?? n['Title'] ?? ''),
        body: String(n['body'] ?? n['Body'] ?? ''),
        type: String(n['type'] ?? n['Type'] ?? ''),
        isRead: Boolean(n['isRead'] ?? n['IsRead'] ?? false),
        createdAt: String(n['createdAt'] ?? n['CreatedAt'] ?? ''),
      };
    });
  }
}
