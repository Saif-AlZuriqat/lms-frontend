import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LearningPathProcessDto {
  title: string;
  description?: string;
}

export interface CourseResponseDTO {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  sections?: { id: number; title: string; lessons?: unknown[] }[];
}

export interface LearningPathResponseDto {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  courses: CourseResponseDTO[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function readArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const wrapped = value as Record<string, unknown>;
    const values = wrapped['$values'] ?? wrapped['values'] ?? wrapped['Items'] ?? wrapped['items'];
    if (Array.isArray(values)) return values;
  }
  return [];
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeCourse(raw: unknown): CourseResponseDTO {
  const node = asObject(raw);
  return {
    id: Number(node['id'] ?? node['Id'] ?? 0),
    title: String(node['title'] ?? node['Title'] ?? ''),
    description: (node['description'] ?? node['Description'] ?? undefined) as string | undefined,
    image: (node['image'] ?? node['Image'] ?? null) as string | null,
    sections: readArray(node['sections'] ?? node['Sections']).map((s) => {
      const sec = asObject(s);
      return {
        id: Number(sec['id'] ?? sec['Id'] ?? 0),
        title: String(sec['title'] ?? sec['Title'] ?? ''),
        lessons: readArray(sec['lessons'] ?? sec['Lessons']),
      };
    }),
  };
}

function normalizePath(raw: unknown): LearningPathResponseDto {
  const node = asObject(raw);
  return {
    id: Number(node['id'] ?? node['Id'] ?? 0),
    title: String(node['title'] ?? node['Title'] ?? ''),
    description: (node['description'] ?? node['Description'] ?? undefined) as string | undefined,
    image: (node['image'] ?? node['Image'] ?? null) as string | null,
    courses: readArray(node['courses'] ?? node['Courses']).map(normalizeCourse),
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private apiUrl = 'http://localhost:5232/api/LearningPath';

  constructor(private http: HttpClient) {}

  getPaths(): Observable<LearningPathResponseDto[]> {
    return this.http.get<unknown>(`${this.apiUrl}/GetPaths`).pipe(
      map((data) => readArray(data).map(normalizePath))
    );
  }

  /** Returns only the paths the currently logged-in employee is enrolled in.
   *  The backend reads the userId from the JWT — HttpClient sends it automatically via authInterceptor. */
  getMyPaths(): Observable<LearningPathResponseDto[]> {
    return this.http.get<unknown>(`${this.apiUrl}/GetMyPaths`).pipe(
      map((data) => readArray(data).map(normalizePath))
    );
  }

  getPathById(id: number): Observable<LearningPathResponseDto> {
    return this.http.get<unknown>(`${this.apiUrl}/GetPathById/${id}`).pipe(
      map((data) => {
        const list = readArray(data);
        return normalizePath(list.length > 0 ? list[0] : data);
      })
    );
  }

  addPath(path: LearningPathProcessDto): Observable<LearningPathResponseDto> {
    return this.http.post<LearningPathResponseDto>(`${this.apiUrl}/AddPath`, path);
  }

  getMyProgress(learningPathId: number): Observable<{ learningPathId: number; progress: number }> {
    return this.http.get<{ learningPathId: number; progress: number }>(
      `${this.apiUrl}/MyProgress/${learningPathId}`
    );
  }

  getContinueLearning(learningPathId: number): Observable<{
    isCompleted: boolean;
    data?: { courseId: number; lessonId: number; sectionId: number };
    message?: string;
  }> {
    return this.http.get<{
      isCompleted: boolean;
      data?: { courseId: number; lessonId: number; sectionId: number };
      message?: string;
    }>(`${this.apiUrl}/ContinueLearning/${learningPathId}`);
  }
}
