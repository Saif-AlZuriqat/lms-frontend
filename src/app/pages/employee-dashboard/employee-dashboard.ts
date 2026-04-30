import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { LearningPathService, LearningPathResponseDto } from '../../services/learning-path.service';
import { BASE_URL } from '../../types/course-builder.types';

interface ContinueLearningSate {
  isCompleted: boolean;
  lessonId: number | null;
  courseId: number | null;
  message: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  paths = signal<LearningPathResponseDto[]>([]);
  progressMap = signal<Map<number, number>>(new Map());
  continueState = signal<ContinueLearningSate | null>(null);
  isLoading = signal(true);
  error = signal('');
  userName = signal('');
  searchQuery = signal('');

  filteredPaths = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.paths();
    return this.paths().filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    );
  });

  lastPath = computed(() => this.paths()[0] ?? null);
  lastPathProgress = computed(() => this.getProgress(this.lastPath()?.id ?? 0));

  private readonly gradients = [
    'linear-gradient(135deg, #0f1b3d 0%, #1e3a8a 100%)',
    'linear-gradient(135deg, #065f56 0%, #0d9488 100%)',
    'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
    'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
  ];

  constructor(
    private learningPathService: LearningPathService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userName.set(this.authService.getUserName());
    this.loadPaths();
  }

  loadPaths() {
    this.isLoading.set(true);
    this.error.set('');
    this.learningPathService.getPaths().subscribe({
      next: (data) => {
        this.paths.set(data);
        this.isLoading.set(false);
        if (data.length > 0) {
          this.loadAllProgress(data);
          this.loadContinueLearning(data[0].id);
        }
      },
      error: () => {
        this.error.set('Failed to load your learning paths. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  loadAllProgress(paths: LearningPathResponseDto[]) {
    const requests = paths.map(p =>
      this.learningPathService.getMyProgress(p.id).pipe(
        catchError(() => of({ learningPathId: p.id, progress: 0 }))
      )
    );
    forkJoin(requests).subscribe(results => {
      const map = new Map<number, number>();
      results.forEach(r => map.set(r.learningPathId, Math.round(r.progress)));
      this.progressMap.set(map);
    });
  }

  loadContinueLearning(pathId: number) {
    this.learningPathService.getContinueLearning(pathId).pipe(
      catchError(() => of(null))
    ).subscribe(result => {
      if (!result) return;
      if (result.isCompleted) {
        this.continueState.set({
          isCompleted: true,
          lessonId: null,
          courseId: null,
          message: result.message ?? 'You have completed this learning path!',
        });
      } else if (result.data) {
        this.continueState.set({
          isCompleted: false,
          lessonId: result.data.lessonId,
          courseId: result.data.courseId,
          message: '',
        });
      }
    });
  }

  resume() {
    const state = this.continueState();
    if (!state || state.isCompleted) {
      // Path completed — open the path overview
      if (this.lastPath()) this.openPath(this.lastPath()!.id);
      return;
    }
    if (state.lessonId) {
      this.router.navigate(['/lesson', state.lessonId]);
    } else if (state.courseId) {
      this.router.navigate(['/course', state.courseId]);
    } else {
      if (this.lastPath()) this.openPath(this.lastPath()!.id);
    }
  }

  getProgress(pathId: number): number {
    return this.progressMap().get(pathId) ?? 0;
  }

  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  getCourseCount(path: LearningPathResponseDto): number {
    return path.courses?.length ?? 0;
  }

  openPath(id: number) {
    this.router.navigate(['/learning-path', id]);
  }

  getPictureUrl(path: LearningPathResponseDto): string {
    if (!path.image) return '';
    if (path.image.startsWith('http')) return path.image;
    return `${BASE_URL}/${path.image.replace(/^\//, '')}`;
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
