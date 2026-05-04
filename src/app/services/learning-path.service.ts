import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * Payload used when creating a learning path.
 */
export interface LearningPathProcessDto {
  title: string;
  description?: string;
}

/**
 * Course data returned inside a learning path response.
 */
export interface CourseResponseDTO {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  sections?: {
    id: number;
    title: string;
    lessons?: unknown[];
  }[];
}

/**
 * Learning path data returned from the backend.
 */
export interface LearningPathResponseDto {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  courses: CourseResponseDTO[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Reads arrays from normal arrays or .NET wrapped responses.
 */
function readArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  const node = asObject(value);

  const values =
    node['$values'] ??
    node['values'] ??
    node['Items'] ??
    node['items'];

  return Array.isArray(values) ? values : [];
}

/**
 * Safely converts unknown values into objects.
 */
function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Reads both camelCase and PascalCase backend keys.
 */
function getValue(
  node: Record<string, unknown>,
  camelCaseKey: string,
  pascalCaseKey: string
): unknown {
  return node[camelCaseKey] ?? node[pascalCaseKey];
}

/**
 * Safely converts a value to a number.
 */
function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

/**
 * Converts a value to string.
 */
function toString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Converts a value to nullable string.
 */
function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : String(value);
}

/**
 * Converts a value to optional string.
 */
function toOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === 'string' ? value : String(value);
}

/**
 * Normalizes raw backend section data.
 */
function normalizeSection(raw: unknown): {
  id: number;
  title: string;
  lessons?: unknown[];
} {
  const node = asObject(raw);

  return {
    id: toNumber(getValue(node, 'id', 'Id')),
    title: toString(getValue(node, 'title', 'Title')),
    lessons: readArray(getValue(node, 'lessons', 'Lessons')),
  };
}

/**
 * Normalizes raw backend course data.
 */
function normalizeCourse(raw: unknown): CourseResponseDTO {
  const node = asObject(raw);

  return {
    id: toNumber(getValue(node, 'id', 'Id')),
    title: toString(getValue(node, 'title', 'Title')),
    description: toOptionalString(getValue(node, 'description', 'Description')),
    image: toNullableString(getValue(node, 'image', 'Image')),
    sections: readArray(getValue(node, 'sections', 'Sections')).map(
      normalizeSection
    ),
  };
}

/**
 * Normalizes raw backend learning path data.
 */
function normalizePath(raw: unknown): LearningPathResponseDto {
  const node = asObject(raw);

  return {
    id: toNumber(getValue(node, 'id', 'Id')),
    title: toString(getValue(node, 'title', 'Title')),
    description: toOptionalString(getValue(node, 'description', 'Description')),
    image: toNullableString(getValue(node, 'image', 'Image')),
    courses: readArray(getValue(node, 'courses', 'Courses')).map(
      normalizeCourse
    ),
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

/**
 * Service responsible for reading learning path data for users.
 *
 * Features:
 * - Get all learning paths
 * - Get enrolled learning paths for current employee
 * - Get learning path by ID
 * - Add a learning path
 * - Get progress for current user
 * - Get continue-learning target
 */
@Injectable({
  providedIn: 'root',
})
export class LearningPathService {
  private readonly apiUrl = 'http://localhost:5232/api/LearningPath';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all learning paths.
   */
  getPaths(): Observable<LearningPathResponseDto[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/GetPaths`)
      .pipe(map((data) => readArray(data).map(normalizePath)));
  }

  /**
   * Fetches only the learning paths the currently logged-in employee is enrolled in.
   *
   * Backend reads the user ID from the JWT.
   * The auth interceptor should attach the token automatically.
   */
  getMyPaths(): Observable<LearningPathResponseDto[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/GetMyPaths`)
      .pipe(map((data) => readArray(data).map(normalizePath)));
  }

  /**
   * Fetches a single learning path by ID.
   *
   * Handles both:
   * - Direct object response
   * - Wrapped/list response
   */
  getPathById(id: number): Observable<LearningPathResponseDto> {
    return this.http.get<unknown>(`${this.apiUrl}/GetPathById/${id}`).pipe(
      map((data) => {
        const list = readArray(data);
        return normalizePath(list.length > 0 ? list[0] : data);
      })
    );
  }

  /**
   * Creates a new learning path.
   */
  addPath(path: LearningPathProcessDto): Observable<LearningPathResponseDto> {
    return this.http.post<LearningPathResponseDto>(
      `${this.apiUrl}/AddPath`,
      path
    );
  }

  /**
   * Gets the current user's progress in a learning path.
   */
  getMyProgress(
    learningPathId: number
  ): Observable<{ learningPathId: number; progress: number }> {
    return this.http.get<{ learningPathId: number; progress: number }>(
      `${this.apiUrl}/MyProgress/${learningPathId}`
    );
  }

  /**
   * Gets the next lesson/course/section the user should continue from.
   */
  getContinueLearning(learningPathId: number): Observable<{
    isCompleted: boolean;
    data?: {
      courseId: number;
      lessonId: number;
      sectionId: number;
    };
    message?: string;
  }> {
    return this.http.get<{
      isCompleted: boolean;
      data?: {
        courseId: number;
        lessonId: number;
        sectionId: number;
      };
      message?: string;
    }>(`${this.apiUrl}/ContinueLearning/${learningPathId}`);
  }
}