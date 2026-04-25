import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-continue-learning',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-continue-learning.html',
  styleUrl: './dashboard-continue-learning.css'
})
export class DashboardContinueLearning {
  @Input() lastCourse = { title: '', progress: 0 };
}
