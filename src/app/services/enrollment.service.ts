import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserSearchResult {
  id: string;
  userName: string;
  email: string;
  role?: string;
}

const ENROLL_COUNTS_KEY = 'lms_enrollment_counts';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private baseUrl = 'http://localhost:5232';

  constructor(private http: HttpClient) {}

  searchUsers(value: string): Observable<UserSearchResult[]> {
    return this.http.get<UserSearchResult[]>(
      `${this.baseUrl}/api/User/SearchUsers?value=${encodeURIComponent(value)}`
    );
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
