import { Injectable } from '@angular/core';
import {
  BASE_URL,
  CourseResponseDTO,
  LearningPathResponseDto,
  LessonResponseDTO,
  SectionResponseDTO,
} from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

@Injectable({ providedIn: 'root' })
export class LearningPathsApiService {
  async getPaths(): Promise<LearningPathResponseDto[]> {
    const data = await fetchJson<unknown>(`${BASE_URL}/api/LearningPath/GetPaths`);
    return readArray(data).map((item) => this.normalizePath(item));
  }

  async getPathById(id: number): Promise<LearningPathResponseDto> {
    const data = await fetchJson<unknown>(`${BASE_URL}/api/LearningPath/GetPathById/${id}`);
    const list = readArray(data);
    if (list.length > 0) {
      return this.normalizePath(list[0]);
    }
    return this.normalizePath(data);
  }

  async addPath(dto: { title: string; description: string | null; picture?: File | null }): Promise<void> {
    await this.sendFormData(`${BASE_URL}/api/LearningPath/AddPath`, 'POST', dto);
  }

  async updatePath(id: number, dto: { title: string; description: string | null; picture?: File | null }): Promise<void> {
    await this.sendFormData(`${BASE_URL}/api/LearningPath/UpdatePath/${id}`, 'PUT', dto);
  }

  private async sendFormData(
    url: string,
    method: 'POST' | 'PUT',
    dto: { title: string; description: string | null; picture?: File | null }
  ): Promise<void> {
    const formData = new FormData();
    formData.append('Title', dto.title);
    if (dto.description) formData.append('Description', dto.description);
    if (dto.picture)     formData.append('Image', dto.picture);

    // Use Headers API (same as fetchJson) — do NOT set Content-Type so
    // the browser adds the multipart/form-data boundary automatically
    const headers = new Headers();
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { method, headers, body: formData });

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

  async deletePath(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/LearningPath/DeletePath/${id}`, { method: 'DELETE' });
  }

  private normalizePath(raw: unknown): LearningPathResponseDto {
    const node = asObject(raw);
    return {
      id: toNumber(node['id'] ?? node['Id']),
      title: toString(node['title'] ?? node['Title']),
      description: toNullableString(node['description'] ?? node['Description']),
      pictureUrl: toNullableString(node['image'] ?? node['Image']),
      courses: readArray(node['courses'] ?? node['Courses']).map((course) => this.normalizeCourse(course)),
    };
  }

  private normalizeCourse(raw: unknown): CourseResponseDTO {
    const node = asObject(raw);
    return {
      id: toNumber(node['id'] ?? node['Id']),
      title: toString(node['title'] ?? node['Title']),
      description: toNullableString(node['description'] ?? node['Description']),
      order: toNumber(node['order'] ?? node['Order']),
      learningPathId: toNumber(node['learningPathId'] ?? node['LearningPathId']),
      pictureUrl: toNullableString(node['image'] ?? node['Image']),
      sections: readArray(node['sections'] ?? node['Sections']).map((section) => this.normalizeSection(section)),
    };
  }

  private normalizeSection(raw: unknown): SectionResponseDTO {
    const node = asObject(raw);
    return {
      id: toNumber(node['id'] ?? node['Id']),
      title: toString(node['title'] ?? node['Title']),
      description: toNullableString(node['description'] ?? node['Description']),
      order: toNumber(node['order'] ?? node['Order']),
      courseId: toNumber(node['courseId'] ?? node['CourseId']),
      lessons: readArray(node['lessons'] ?? node['Lessons']).map((lesson) => this.normalizeLesson(lesson)),
    };
  }

  private normalizeLesson(raw: unknown): LessonResponseDTO {
    const node = asObject(raw);
    return {
      id: toNumber(node['id'] ?? node['Id']),
      title: toString(node['title'] ?? node['Title']),
      description: toNullableString(node['description'] ?? node['Description']),
      content: toNullableString(node['content'] ?? node['Content']),
      videoUrl: toNullableString(node['videoUrl'] ?? node['VideoUrl']),
      order: toNumber(node['order'] ?? node['Order']),
      sectionId: toNumber(node['sectionId'] ?? node['SectionId']),
    };
  }
}

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

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0) || 0;
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : String(value);
}
