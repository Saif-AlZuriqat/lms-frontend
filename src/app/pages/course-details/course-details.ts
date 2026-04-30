import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoursesApiService } from '../../services/courses-api.service';
import { SectionsApiService } from '../../services/sections-api.service';
import { CourseResponseDTO, SectionResponseDTO } from '../../types/course-builder.types';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails implements OnInit {
  course = signal<CourseResponseDTO | null>(null);
  sections = signal<SectionResponseDTO[]>([]);
  isLoading = signal(true);
  error = signal('');
  expandedSections = signal<Set<number>>(new Set());
  pathId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursesApi: CoursesApiService,
    private sectionsApi: SectionsApiService,
  ) {}

  ngOnInit() {
    const state = history.state as Record<string, unknown>;

    if (state?.['course']) {
      this.course.set(state['course'] as CourseResponseDTO);
      this.pathId = (state['pathId'] as number) ?? null;
      void this.loadSections((state['course'] as CourseResponseDTO).id);
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
        void this.loadCourse(id);
      } else {
        this.error.set('Course not found.');
        this.isLoading.set(false);
      }
    }
  }

  async loadCourse(id: number) {
    try {
      const course = await this.coursesApi.getCourseById(id);
      this.course.set(course);
      await this.loadSections(id);
    } catch {
      this.error.set('Failed to load course.');
      this.isLoading.set(false);
    }
  }

  async loadSections(courseId: number) {
    this.isLoading.set(true);
    try {
      const sections = await this.sectionsApi.getSectionsByCourse(courseId);
      this.sections.set(sections);
    } catch {
      this.error.set('Failed to load course content.');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleSection(sectionId: number) {
    const current = new Set(this.expandedSections());
    if (current.has(sectionId)) {
      current.delete(sectionId);
    } else {
      current.add(sectionId);
    }
    this.expandedSections.set(current);
  }

  isSectionExpanded(sectionId: number): boolean {
    return this.expandedSections().has(sectionId);
  }

  openLesson(lessonId: number) {
    this.router.navigate(['/lesson', lessonId]);
  }

  backLink(): string[] {
    return this.pathId ? ['/learning-path', String(this.pathId)] : ['/employee/dashboard'];
  }
}
