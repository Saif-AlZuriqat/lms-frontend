import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonsApiService } from '../../services/lessons-api.service';
import { SectionsApiService } from '../../services/sections-api.service';
import { CoursesApiService } from '../../services/courses-api.service';
import { LessonResponseDTO, SectionResponseDTO, CourseResponseDTO } from '../../types/course-builder.types';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.css',
})
export class LessonViewer implements OnInit {
  lesson = signal<LessonResponseDTO | null>(null);
  course = signal<CourseResponseDTO | null>(null);
  sections = signal<SectionResponseDTO[]>([]);
  expandedSections = signal<Set<number>>(new Set());
  
  // Track completed lessons locally since API response doesn't include it
  completedLessons = signal<Set<number>>(new Set());

  isLoading = signal(true);
  isCompleting = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private lessonsApi: LessonsApiService,
    private sectionsApi: SectionsApiService,
    private coursesApi: CoursesApiService,
    private sanitizer: DomSanitizer
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

  getYouTubeEmbedUrl(lesson: LessonResponseDTO | null): SafeResourceUrl | null {
    if (!lesson || lesson.type !== 3 || !lesson.videoUrl) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = lesson.videoUrl.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=0`);
    }
    return null;
  }

  getMediaUrl(lesson: LessonResponseDTO | null): string | null {
    if (!lesson || !lesson.videoUrl) return null;
    
    // Type 3 is Link (URL), return as-is
    if (lesson.type === 3) return lesson.videoUrl;
    
    // External links (just in case)
    if (lesson.videoUrl.startsWith('http')) return lesson.videoUrl;
    
    // Prepend BASE_URL for uploaded files
    const baseUrl = 'http://localhost:5232';
    return `${baseUrl}/${lesson.videoUrl.replace(/^\//, '')}`;
  }

  countTotalLessons(): number {
    return this.sections().reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
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
    if (this.lesson()?.id === lessonId) return;
    this.router.navigate(['/lesson', lessonId]);
  }

  async toggleCompletion(lessonId: number, event: Event) {
    event.stopPropagation();
    
    const completed = new Set(this.completedLessons());
    if (completed.has(lessonId)) {
      // Currently no API to un-complete, so we just remove from local state
      completed.delete(lessonId);
      this.completedLessons.set(completed);
      localStorage.setItem('completed_lessons', JSON.stringify(Array.from(completed)));
      return;
    }

    // Mark as complete
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

  isLessonCompleted(lessonId: number): boolean {
    return this.completedLessons().has(lessonId);
  }

  goBack() {
    this.location.back();
  }
}
