import { Injectable } from '@angular/core';
import { BASE_URL, LessonResponseDTO, SectionResponseDTO } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function toNullable(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : String(value);
}

function normalizeLesson(raw: unknown): LessonResponseDTO {
  const node = asObject(raw);
  return {
    id: Number(node['id'] ?? node['Id'] ?? 0),
    title: String(node['title'] ?? node['Title'] ?? ''),
    description: toNullable(node['description'] ?? node['Description']),
    content: toNullable(node['content'] ?? node['Content']),
    videoUrl: toNullable(node['videoUrl'] ?? node['VideoUrl']),
    order: Number(node['order'] ?? node['Order'] ?? 0),
    sectionId: Number(node['sectionId'] ?? node['SectionId'] ?? 0),
    type: Number(node['type'] ?? node['Type'] ?? 0),
  };
}

function normalizeSection(raw: unknown): SectionResponseDTO {
  const node = asObject(raw);
  return {
    id: Number(node['id'] ?? node['Id'] ?? 0),
    title: String(node['title'] ?? node['Title'] ?? ''),
    description: toNullable(node['description'] ?? node['Description']),
    order: Number(node['order'] ?? node['Order'] ?? 0),
    courseId: Number(node['courseId'] ?? node['CourseId'] ?? 0),
    lessons: readArray(node['lessons'] ?? node['Lessons']).map(normalizeLesson),
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SectionsApiService {
  async getSectionsByCourse(courseId: number): Promise<SectionResponseDTO[]> {
    const data = await fetchJson<unknown>(`${BASE_URL}/api/Sections/GetSectionsByCourse/${courseId}`);
    return readArray(data).map(normalizeSection);
  }

  async getSectionById(id: number): Promise<SectionResponseDTO> {
    const data = await fetchJson<unknown>(`${BASE_URL}/api/Sections/GetSectionById/${id}`);
    return normalizeSection(data);
  }

  async createSection(dto: { title: string; description: string | null; courseId: number }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Sections/CreateSection`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateSection(id: number, dto: { title: string; description: string | null }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteSection(id: number): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Sections/${id}`, { method: 'DELETE' });
  }
}
