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

  async createCourse(dto: { title: string; description: string | null; learningPathId: number; picture?: File | null }): Promise<void> {
    const formData = new FormData();
    formData.append('Title', dto.title);
    if (dto.description) {
      formData.append('Description', dto.description);
    }
    formData.append('LearningPathId', String(dto.learningPathId));
    if (dto.picture) {
      formData.append('Image', dto.picture);
    }

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/Course/CreateCourses`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.message || errorBody?.title || JSON.stringify(errorBody) || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {}
      }
      throw new Error(errorMessage);
    }
  }

  async updateCourse(id: number, dto: { title: string; description: string | null; learningPathId: number; picture?: File | null }): Promise<void> {
    const formData = new FormData();
    formData.append('Title', dto.title);
    if (dto.description) {
      formData.append('Description', dto.description);
    }
    formData.append('LearningPathId', String(dto.learningPathId));
    if (dto.picture) {
      formData.append('Image', dto.picture);
    }

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/Course/UpdateCourse/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.message || errorBody?.title || JSON.stringify(errorBody) || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {}
      }
      throw new Error(errorMessage);
    }
  }

  async deleteCourse(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Course/DeleteCourse/${id}`, { method: 'DELETE' });
  }
}
