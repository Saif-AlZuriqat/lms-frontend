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
  // Add other properties if known, or just keep basic
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
    return this.http.post<LearningPathResponseDto>(`${this.apiUrl}/AddPath`, path);
  }
}
