import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BASE_URL, CourseResponseDTO } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

@Injectable({ providedIn: 'root' })
export class CoursesApiService {

  constructor(private http: HttpClient) {}

  async getCoursesByPath(learningPathId: number): Promise<CourseResponseDTO[]> {
    return fetchJson<CourseResponseDTO[]>(`${BASE_URL}/api/Course/GetCoursesByPath/${learningPathId}`);
  }

  async getCourseById(id: number): Promise<CourseResponseDTO> {
    return fetchJson<CourseResponseDTO>(`${BASE_URL}/api/Course/${id}`);
  }

  async createCourse(dto: { title: string; description: string | null; learningPathId: number; picture?: File | null }): Promise<void> {
    const formData = this.buildFormData(dto);
    const headers = this.authHeaders();
    await firstValueFrom(
      this.http.post(`${BASE_URL}/api/Course/CreateCourses`, formData, { headers, responseType: 'text' })
    );
  }

  async updateCourse(id: number, dto: { title: string; description: string | null; learningPathId: number; picture?: File | null }): Promise<void> {
    const formData = this.buildFormData(dto);
    const headers = this.authHeaders();
    await firstValueFrom(
      this.http.put(`${BASE_URL}/api/Course/UpdateCourse/${id}`, formData, { headers, responseType: 'text' })
    );
  }

  async deleteCourse(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Course/DeleteCourse/${id}`, { method: 'DELETE' });
  }

  private buildFormData(dto: { title: string; description: string | null; learningPathId: number; picture?: File | null }): FormData {
    const formData = new FormData();
    formData.append('Title', dto.title);
    formData.append('LearningPathId', String(dto.learningPathId));
    if (dto.description) formData.append('Description', dto.description);
    if (dto.picture)     formData.append('Image', dto.picture);
    return formData;
  }

  // Only set Authorization — never Content-Type, so the browser can set
  // the multipart/form-data boundary automatically
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
