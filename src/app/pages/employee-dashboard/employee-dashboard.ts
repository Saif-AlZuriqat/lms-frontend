import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LearningPathService, LearningPathResponseDto } from '../../services/learning-path.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  paths = signal<LearningPathResponseDto[]>([]);
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
      },
      error: () => {
        this.error.set('Failed to load your learning paths. Please try again.');
        this.isLoading.set(false);
      },
    });
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

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
