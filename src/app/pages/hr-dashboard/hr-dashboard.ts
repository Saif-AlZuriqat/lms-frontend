import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { LearningPathService, LearningPathResponseDto } from '../../services/learning-path.service';
import { ActivityService, AdminActivity } from '../../services/activity.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationBellComponent],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard implements OnInit {
  userName = signal('');
  paths = signal<LearningPathResponseDto[]>([]);
  activities = signal<AdminActivity[]>([]);

  constructor(
    private authService: AuthService,
    private router: Router,
    private learningPathService: LearningPathService,
    private activityService: ActivityService,
    private enrollmentService: EnrollmentService,
  ) {}

  ngOnInit() {
    this.userName.set(this.authService.getUserName());

    this.learningPathService.getPaths().subscribe({
      next: (data) => this.paths.set(data),
      error: () => {},
    });

    this.activities.set(this.activityService.getRecent(8));
  }

  getCourseCount(path: LearningPathResponseDto): number {
    return path.courses?.length ?? 0;
  }

  /** Width % for the path bar — scales relative to the max course count */
  getEnrolledCount(pathId: number): number {
    return this.enrollmentService.getEnrollCount(pathId);
  }

  getBarWidth(path: LearningPathResponseDto): number {
    const all = this.paths();
    const max = Math.max(...all.map(p => this.enrollmentService.getEnrollCount(p.id)), 1);
    const count = this.enrollmentService.getEnrollCount(path.id);
    return Math.max(Math.round((count / max) * 100), 6);
  }

  timeAgo(iso: string): string {
    return this.activityService.timeAgo(iso);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
