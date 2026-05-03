import { Injectable } from '@angular/core';
import { BASE_URL } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

export interface CanAccessResult {
  courseId: number;
  canAccess: boolean;
  /** Present when canAccess is false — backend 403 message */
  reason?: string;
}

export interface CourseProgressResult {
  courseId: number;
  progress: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {

  async canAccess(courseId: number): Promise<CanAccessResult> {
    try {
      const data = await fetchJson<unknown>(`${BASE_URL}/api/Progress/CanAccess/${courseId}`);
      const node = data as Record<string, unknown>;
      return {
        courseId: Number(node['courseId'] ?? node['CourseId'] ?? courseId),
        canAccess: Boolean(node['canAccess'] ?? node['CanAccess'] ?? true),
      };
    } catch (err) {
      const error = err as { message?: string };
      const msg = error?.message ?? '';

      // 403 means the backend explicitly denied access (previous course not ≥85%)
      if (msg.includes('403') || msg.toLowerCase().includes('complete previous')) {
        return { courseId, canAccess: false, reason: msg };
      }
      // 401 — not logged in; let the auth guard handle it
      if (msg.includes('401')) {
        return { courseId, canAccess: false, reason: 'Please log in to access this course.' };
      }
      // Any other error (network, 500…) — fail open so students aren't blocked by a backend glitch
      return { courseId, canAccess: true };
    }
  }

  async getCourseProgress(courseId: number): Promise<CourseProgressResult> {
    try {
      const data = await fetchJson<unknown>(`${BASE_URL}/api/Progress/${courseId}`);
      const node = data as Record<string, unknown>;
      return {
        courseId: Number(node['courseId'] ?? node['CourseId'] ?? courseId),
        progress: Number(node['progress'] ?? node['Progress'] ?? 0),
      };
    } catch {
      return { courseId, progress: 0 };
    }
  }
}
