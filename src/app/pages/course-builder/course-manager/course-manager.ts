import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InlineAddFormComponent } from '../../../components/course-builder/inline-add-form.component';
import { InlineEditComponent } from '../../../components/course-builder/inline-edit.component';
import { CoursesApiService } from '../../../services/courses-api.service';
import { LearningPathsApiService } from '../../../services/learning-paths-api.service';
import { LessonsApiService } from '../../../services/lessons-api.service';
import { SectionsApiService } from '../../../services/sections-api.service';
import { ToastService } from '../../../services/toast.service';
import { LearningPathResponseDto, LessonResponseDTO, SectionResponseDTO } from '../../../types/course-builder.types';

@Component({
  selector: 'app-course-manager-page',
  standalone: true,
  imports: [CommonModule, RouterLink, InlineEditComponent, InlineAddFormComponent],
  templateUrl: './course-manager.html',
  styleUrl: './course-manager.css',
})
export class CourseManagerPage implements OnInit {
  pathId = 0;
  tree: LearningPathResponseDto | null = null;
  loading = true;
  error = '';
  expandedCourseIds = new Set<number>();
  expandedSectionIds = new Set<number>();
  openAddFormKey = '';
  editingKey = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly pathsApi: LearningPathsApiService,
    private readonly coursesApi: CoursesApiService,
    private readonly sectionsApi: SectionsApiService,
    private readonly lessonsApi: LessonsApiService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('learningPathId'));
    if (!id) {
      this.error = 'Invalid learning path id.';
      this.loading = false;
      return;
    }
    this.pathId = id;
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.tree = await this.pathsApi.getPathById(this.pathId);
    } catch (error) {
      this.error = (error as Error).message || 'Failed to load learning path.';
      this.toast.error(this.error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  toggleCourse(id: number): void {
    this.expandedCourseIds.has(id) ? this.expandedCourseIds.delete(id) : this.expandedCourseIds.add(id);
  }

  toggleSection(id: number): void {
    this.expandedSectionIds.has(id) ? this.expandedSectionIds.delete(id) : this.expandedSectionIds.add(id);
  }

  async addCourse(event: { title: string; description: string }): Promise<void> {
    try {
      await this.coursesApi.createCourse({ title: event.title, description: event.description || null, learningPathId: this.pathId });
      this.toast.success('Course added');
      this.openAddFormKey = '';
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Add course failed');
    }
  }

  async addSection(courseId: number, event: { title: string; description: string }): Promise<void> {
    try {
      await this.sectionsApi.createSection({ title: event.title, description: event.description || null, courseId });
      this.toast.success('Section added');
      this.openAddFormKey = '';
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Add section failed');
    }
  }

  async addLesson(sectionId: number, event: { title: string; description: string }): Promise<void> {
    try {
      await this.lessonsApi.createLesson({ title: event.title, description: event.description || null, content: '', sectionId });
      this.toast.success('Lesson added');
      this.openAddFormKey = '';
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Add lesson failed');
    }
  }

  async updateCourse(courseId: number, event: { title: string; description: string }): Promise<void> {
    try {
      await this.coursesApi.updateCourse(courseId, { title: event.title, description: event.description || null, learningPathId: this.pathId });
      this.editingKey = '';
      this.toast.success('Course updated');
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Update course failed');
    }
  }

  async updateSection(sectionId: number, event: { title: string; description: string }): Promise<void> {
    try {
      await this.sectionsApi.updateSection(sectionId, { title: event.title, description: event.description || null });
      this.editingKey = '';
      this.toast.success('Section updated');
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Update section failed');
    }
  }

  async updateLesson(lesson: LessonResponseDTO, event: { title: string; description: string }): Promise<void> {
    try {
      await this.lessonsApi.updateLesson(lesson.id, { title: event.title, description: event.description || null, content: lesson.content || '' });
      this.editingKey = '';
      this.toast.success('Lesson updated');
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Update lesson failed');
    }
  }

  async removeCourse(id: number): Promise<void> {
    if (!confirm('Delete this course?')) return;
    await this.safeDelete(async () => this.coursesApi.deleteCourse(id), 'Course deleted');
  }

  async removeSection(id: number): Promise<void> {
    if (!confirm('Delete this section?')) return;
    await this.safeDelete(async () => this.sectionsApi.deleteSection(id), 'Section deleted');
  }

  async removeLesson(id: number): Promise<void> {
    if (!confirm('Delete this lesson?')) return;
    await this.safeDelete(async () => this.lessonsApi.deleteLesson(id), 'Lesson deleted');
  }

  editLessonContent(id: number): void {
    void this.router.navigate(['/lessons', id, 'edit']);
  }

  private async safeDelete(action: () => Promise<void>, successMessage: string): Promise<void> {
    try {
      await action();
      this.toast.success(successMessage);
      await this.reload();
    } catch (error) {
      this.toast.error((error as Error).message || 'Delete failed');
    }
  }

  sectionKey(section: SectionResponseDTO): string {
    return `section-${section.id}`;
  }
}
