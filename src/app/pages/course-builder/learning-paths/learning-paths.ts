import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LearningPathCardComponent } from '../../../components/course-builder/learning-path-card.component';
import { ModalComponent } from '../../../components/course-builder/modal.component';
import { LearningPathsApiService } from '../../../services/learning-paths-api.service';
import { ToastService } from '../../../services/toast.service';
import { LearningPathResponseDto } from '../../../types/course-builder.types';

@Component({
  selector: 'app-learning-paths-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LearningPathCardComponent, ModalComponent],
  templateUrl: './learning-paths.html',
  styleUrl: './learning-paths.css',
})
export class LearningPathsPage implements OnInit {
  loading = true;
  error = '';
  paths: LearningPathResponseDto[] = [];
  modalOpen = false;
  editingId: number | null = null;
  title = '';
  description = '';

  constructor(
    private readonly api: LearningPathsApiService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.loadPaths();
  }

  async loadPaths(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.paths = await this.api.getPaths();
    } catch (error) {
      this.error = (error as Error).message || 'Failed to load learning paths.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openCreateModal(): void {
    this.editingId = null;
    this.title = '';
    this.description = '';
    this.modalOpen = true;
  }

  openEditModal(path: LearningPathResponseDto): void {
    this.editingId = path.id;
    this.title = path.title;
    this.description = path.description ?? '';
    this.modalOpen = true;
  }

  async submitModal(): Promise<void> {
    if (!this.title.trim()) return;
    try {
      if (this.editingId === null) {
        await this.api.addPath({ title: this.title.trim(), description: this.description.trim() || null });
        this.toast.success('Learning path created');
      } else {
        await this.api.updatePath(this.editingId, { title: this.title.trim(), description: this.description.trim() || null });
        this.toast.success('Learning path updated');
      }
      this.modalOpen = false;
      await this.loadPaths();
    } catch (error) {
      this.toast.error((error as Error).message || 'Unable to save learning path');
    }
  }

  async deletePath(id: number): Promise<void> {
    if (!confirm('Delete this learning path?')) return;
    try {
      await this.api.deletePath(id);
      this.toast.success('Learning path deleted');
      await this.loadPaths();
    } catch (error) {
      this.toast.error((error as Error).message || 'Unable to delete learning path');
    }
  }

  manageCourses(id: number): void {
    void this.router.navigate(['/learning-paths', id]);
  }
}
