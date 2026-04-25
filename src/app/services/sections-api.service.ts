import { Injectable } from '@angular/core';
import { BASE_URL, SectionResponseDTO } from '../types/course-builder.types';
import { fetchJson } from './course-builder-api.utils';

@Injectable({ providedIn: 'root' })
export class SectionsApiService {
  async getSectionsByCourse(courseId: number): Promise<SectionResponseDTO[]> {
    return fetchJson<SectionResponseDTO[]>(`${BASE_URL}/api/Sections/GetSectionsByCourse/${courseId}`);
  }

  async getSectionById(id: number): Promise<SectionResponseDTO> {
    return fetchJson<SectionResponseDTO>(`${BASE_URL}/api/Sections/GetSectionById/${id}`);
  }

  async createSection(dto: { title: string; description: string | null; courseId: number }): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/api/Sections`, {
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
