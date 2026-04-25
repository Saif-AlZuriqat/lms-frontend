import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LearningPathService,
  LearningPathResponseDto,
  LearningPathProcessDto,
} from '../../services/learning-path.service';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './learning-path.html',
  styleUrl: './learning-path.css',
})
export class LearningPath implements OnInit {
  paths = signal<LearningPathResponseDto[]>([]);
  newPath = signal<LearningPathProcessDto>({ title: '', description: '' });
  isLoading = signal(false);
  error = signal('');

  constructor(private learningPathService: LearningPathService) {}

  ngOnInit() {
    this.loadPaths();
  }

  loadPaths() {
    this.learningPathService.getPaths().subscribe({
      next: (data) => this.paths.set(data),
      error: (err) => {
        console.error('Error loading learning paths', err);
        this.paths.set([]);
      },
    });
  }

  createPath() {
    if (!this.newPath().title) return;

    const tempId = -Date.now();
    const optimistic: LearningPathResponseDto = {
      id: tempId,
      title: this.newPath().title,
      description: this.newPath().description,
      courses: [],
    };
    this.paths.update(list => [...list, optimistic]);

    const payload = { ...this.newPath() };
    this.newPath.set({ title: '', description: '' });
    this.isLoading.set(true);
    this.error.set('');

    this.learningPathService.addPath(payload).subscribe({
      next: (created) => {
        this.isLoading.set(false);
        if (created && created.id) {
          this.paths.update(list =>
            list.map(p => p.id === tempId ? { ...created, courses: created.courses ?? [] } : p)
          );
        } else {
          this.loadPaths();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.paths.update(list => list.filter(p => p.id !== tempId));
        this.isLoading.set(false);
        if (err.status === 401) {
          this.error.set('Unauthorized (401): You are not logged in or your session expired.');
        } else if (err.status === 403) {
          this.error.set('Forbidden (403): Your account does not have permission to create learning paths.');
        } else if (err.status === 404) {
          this.error.set('Not Found (404): The create endpoint could not be reached. Check the API URL.');
        } else if (err.status === 400) {
          const detail = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
          this.error.set(`Bad Request (400): ${detail}`);
        } else {
          this.error.set(`Error ${err.status}: ${err.message}`);
        }
        console.error(err);
      },
    });
  }
}
