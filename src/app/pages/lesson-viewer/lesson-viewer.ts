import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LessonsApiService } from '../../services/lessons-api.service';
import { LessonResponseDTO } from '../../types/course-builder.types';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.css',
})
export class LessonViewer implements OnInit {
  lesson = signal<LessonResponseDTO | null>(null);
  isLoading = signal(true);
  isCompleting = signal(false);
  isCompleted = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private lessonsApi: LessonsApiService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      void this.loadLesson(id);
    } else {
      this.error.set('Lesson not found.');
      this.isLoading.set(false);
    }
  }

  async loadLesson(id: number) {
    try {
      const lesson = await this.lessonsApi.getLessonById(id);
      this.lesson.set(lesson);
    } catch {
      this.error.set('Failed to load lesson.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async markComplete() {
    if (this.isCompleted() || this.isCompleting()) return;
    this.isCompleting.set(true);
    this.error.set('');
    try {
      await this.lessonsApi.completeLesson(this.lesson()!.id);
      this.isCompleted.set(true);
    } catch {
      this.error.set('Failed to mark lesson as complete. Please try again.');
    } finally {
      this.isCompleting.set(false);
    }
  }

  goBack() {
    this.location.back();
  }
}
