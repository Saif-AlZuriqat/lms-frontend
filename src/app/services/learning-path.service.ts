import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private apiUrl = 'http://localhost:5232/api/LearningPath';

  constructor(private http: HttpClient) {}

  getPaths(): Observable<LearningPathResponseDto[]> {
    return this.http.get<LearningPathResponseDto[]>(`${this.apiUrl}/GetPaths/`);
  }

  getPathById(id: number): Observable<LearningPathResponseDto> {
    return this.http.get<LearningPathResponseDto>(`${this.apiUrl}/GetPathById/${id}`);
  }

  addPath(path: LearningPathProcessDto): Observable<LearningPathResponseDto> {
    return this.http.post<LearningPathResponseDto>(`${this.apiUrl}/AddPathAsync/`, path);
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
