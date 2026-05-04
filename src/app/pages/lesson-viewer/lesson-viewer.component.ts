import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonsApiService } from '../../services/lessons-api.service';
import { SectionsApiService } from '../../services/sections-api.service';
import { CoursesApiService } from '../../services/courses-api.service';
import { LessonResponseDTO, SectionResponseDTO, CourseResponseDTO } from '../../types/course-builder.types';

import { LessonSidebarComponent } from './components/lesson-sidebar/lesson-sidebar.component';
import { LessonContentComponent } from './components/lesson-content/lesson-content.component';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, LessonSidebarComponent, LessonContentComponent],
  templateUrl: './lesson-viewer.component.html',
  styleUrl: './lesson-viewer.component.css',
})
export class LessonViewerComponent implements OnInit {
  lesson = signal<LessonResponseDTO | null>(null);
  course = signal<CourseResponseDTO | null>(null);
  sections = signal<SectionResponseDTO[]>([]);
  
  expandedSections = signal<Set<number>>(new Set());
  completedLessons = signal<Set<number>>(new Set());

  // Computed arrays for dumb components
  expandedSectionIds = computed(() => Array.from(this.expandedSections()));
  completedLessonIds = computed(() => Array.from(this.completedLessons()));

  isLoading = signal(true);
  isCompleting = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private lessonsApi: LessonsApiService,
    private sectionsApi: SectionsApiService,
    private coursesApi: CoursesApiService
  ) {}

  ngOnInit() {
    // Load local storage completions
    try {
      const stored = localStorage.getItem('completed_lessons');
      if (stored) {
        this.completedLessons.set(new Set(JSON.parse(stored)));
      }
    } catch(e) {}

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        void this.loadLessonAndCurriculum(id);
      } else {
        this.error.set('Lesson not found.');
        this.isLoading.set(false);
      }
    });
  }

  async loadLessonAndCurriculum(lessonId: number) {
    this.isLoading.set(true);
    try {
      const lesson = await this.lessonsApi.getLessonById(lessonId);
      this.lesson.set(lesson);
      
      this.expandedSections.update(set => new Set(set).add(lesson.sectionId));

      if (!this.course() || !this.sections().some(s => s.id === lesson.sectionId)) {
        const section = await this.sectionsApi.getSectionById(lesson.sectionId);
        const courseId = section.courseId;
        const [course, allSections] = await Promise.all([
          this.coursesApi.getCourseById(courseId),
          this.sectionsApi.getSectionsByCourse(courseId)
        ]);
        this.course.set(course);
        this.sections.set(allSections);
      }
    } catch (e) {
      this.error.set('Failed to load lesson or curriculum.');
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

  openLesson(lessonId: number) {
    if (this.lesson()?.id === lessonId) return;
    this.router.navigate(['/lesson', lessonId]);
  }

  async toggleCompletion(eventData: { lessonId: number, event: Event }) {
    const { lessonId, event } = eventData;
    event.stopPropagation();
    
    const completed = new Set(this.completedLessons());
    if (completed.has(lessonId)) {
      completed.delete(lessonId);
      this.completedLessons.set(completed);
      localStorage.setItem('completed_lessons', JSON.stringify(Array.from(completed)));
      return;
    }

    this.isCompleting.set(true);
    try {
      await this.lessonsApi.completeLesson(lessonId);
      completed.add(lessonId);
      this.completedLessons.set(completed);
      localStorage.setItem('completed_lessons', JSON.stringify(Array.from(completed)));
    } catch {
      // Ignore errors for now, or show toast
    } finally {
      this.isCompleting.set(false);
    }
  }

  goBack() {
    this.location.back();
  }
}
