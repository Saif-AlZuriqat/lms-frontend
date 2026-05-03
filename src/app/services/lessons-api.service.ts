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
    videoUrl: File;
    sectionId: number;
    order: number;
  }): Promise<void> {
    const formData = new FormData();
    formData.append('title', dto.title);
    if (dto.description) formData.append('description', dto.description);
    if (dto.content) formData.append('content', dto.content);
    formData.append('videoUrl', dto.videoUrl);
    formData.append('sectionId', String(dto.sectionId));
    formData.append('order', String(dto.order));

    const headers = new Headers();
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}/api/Lessons/CreateLesson`, {
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
        try { const text = await response.text(); if (text) errorMessage = text; } catch {}
      }
      throw new Error(errorMessage);
    }
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
