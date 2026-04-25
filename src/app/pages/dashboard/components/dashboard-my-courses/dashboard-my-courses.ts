import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-my-courses',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-my-courses.html',
  styleUrl: './dashboard-my-courses.css'
})
export class DashboardMyCourses {
  @Input() courses: { id: number; title: string; progress: number; icon: string; color: string }[] = [];
}
