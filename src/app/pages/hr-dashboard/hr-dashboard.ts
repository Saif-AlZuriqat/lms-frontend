import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { LearningPathService, LearningPathResponseDto } from '../../services/learning-path.service';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard implements OnInit {
  userName = signal('');
  paths = signal<LearningPathResponseDto[]>([]);
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private learningPathService: LearningPathService,
  ) {}

  ngOnInit() {
    this.userName.set(this.authService.getUserName());
    this.learningPathService.getPaths().subscribe({
      next: (data) => this.paths.set(data),
      error: () => {},
    });
  }

  getCourseCount(path: LearningPathResponseDto): number {
    return path.courses?.length ?? 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
