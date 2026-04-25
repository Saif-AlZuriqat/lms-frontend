import { Injectable } from '@angular/core';
import { BASE_URL, CourseResponseDTO } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

@Injectable({ providedIn: 'root' })
export class CoursesApiService {
  async getCoursesByPath(learningPathId: number): Promise<CourseResponseDTO[]> {
    return fetchJson<CourseResponseDTO[]>(`${BASE_URL}/api/Course/GetCoursesByPath/${learningPathId}`);
  }

  async getCourseById(id: number): Promise<CourseResponseDTO> {
    return fetchJson<CourseResponseDTO>(`${BASE_URL}/api/Course/GetCourseById/${id}`);
  }

  async createCourse(dto: { title: string; description: string | null; learningPathId: number }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Course/CreateCourses`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateCourse(id: number, dto: { title: string; description: string | null; learningPathId: number }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Course/UpdateCourse/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteCourse(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Course/DeleteCourse/${id}`, { method: 'DELETE' });
  }
}
