import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserSearchResult {
  id: string;
  userName: string;
  email?: string;
}

export interface UserInfo {
  id: string;
  userName: string;
  email: string;
  createdAt: string;
  enrollments: { id?: number; learningPathId?: number; courseId?: number }[];
  progresses: unknown[];
}

const ENROLL_COUNTS_KEY = 'lms_enrollment_counts';

function readArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const wrapped = value as Record<string, unknown>;
    const values = wrapped['$values'] ?? wrapped['values'] ?? wrapped['Items'] ?? wrapped['items'];
    if (Array.isArray(values)) return values;
  }
  return [];
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private baseUrl = 'http://localhost:5232';

  constructor(private http: HttpClient) {}

  searchUsers(value: string): Observable<UserSearchResult[]> {
    return this.http.get<UserSearchResult[]>(
      `${this.baseUrl}/api/User/SearchUsers?value=${encodeURIComponent(value)}`
    );
  }

  getUserInfo(id: string): Observable<UserInfo> {
    return this.http.get<unknown>(
      `${this.baseUrl}/api/User/GetUserInfo/${id}`
    ).pipe(
      map((raw) => this.normalizeUserInfo(raw))
    );
  }

  private normalizeUserInfo(raw: unknown): UserInfo {
    const node = raw as Record<string, unknown>;
    return {
      id: String(node['id'] ?? node['Id'] ?? ''),
      userName: String(node['userName'] ?? node['UserName'] ?? ''),
      email: String(node['email'] ?? node['Email'] ?? ''),
      createdAt: String(node['createdAt'] ?? node['CreatedAt'] ?? ''),
      enrollments: readArray(node['enrollments'] ?? node['Enrollments']).map(e => {
        const en = e as Record<string, unknown>;
        return {
          id: en['id'] as number | undefined,
          learningPathId: en['learningPathId'] as number | undefined,
          courseId: en['courseId'] as number | undefined,
        };
      }),
      progresses: readArray(node['progresses'] ?? node['Progresses']),
    };
  }

  enroll(userId: string, learningPathId: number): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/api/Enrollment`,
      { userId, courseId: 0, learningPathId },
      { responseType: 'text' }
    );
  }

  /** Increment the local enrollment counter for a path after a successful enroll() */
  incrementEnrollCount(learningPathId: number): void {
    const counts = this.getEnrollCounts();
    counts[learningPathId] = (counts[learningPathId] ?? 0) + 1;
    try { localStorage.setItem(ENROLL_COUNTS_KEY, JSON.stringify(counts)); } catch { /* ignore */ }
  }

  /** Get the locally-tracked enrollment count for a specific path */
  getEnrollCount(learningPathId: number): number {
    return this.getEnrollCounts()[learningPathId] ?? 0;
  }

  /** Get all tracked counts as a map { pathId: count } */
  getEnrollCounts(): Record<number, number> {
    try {
      const raw = localStorage.getItem(ENROLL_COUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
}
