import { Injectable } from '@angular/core';
import { BASE_URL, LessonResponseDTO } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

@Injectable({ providedIn: 'root' })
export class LessonsApiService {
  async getLessonsBySection(sectionId: number): Promise<LessonResponseDTO[]> {
    return fetchJson<LessonResponseDTO[]>(`${BASE_URL}/api/Lessons/GetLessonsBySection/${sectionId}`);
  }

  async getLessonById(id: number): Promise<LessonResponseDTO> {
    return fetchJson<LessonResponseDTO>(`${BASE_URL}/api/Lessons/GetLessonById/${id}`);
  }

  async createLesson(dto: {
    title: string;
    description: string | null;
    content: string | null;
    sectionId: number;
  }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Lessons`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateLesson(id: number, dto: { title: string; description: string | null; content: string | null }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteLesson(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Lessons/${id}`, { method: 'DELETE' });
  }

  async completeLesson(lessonId: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Lessons/CompleteLesson/${lessonId}`, { method: 'POST' });
  }
}
