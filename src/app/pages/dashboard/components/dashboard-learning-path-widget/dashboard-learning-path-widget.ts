import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-learning-path-widget',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-learning-path-widget.html',
  styleUrl: './dashboard-learning-path-widget.css'
})
export class DashboardLearningPathWidget {
  @Input() learningPath: {
    title: string;
    description: string;
    completed: number;
    total: number;
    steps: { name: string; done: boolean }[];
  } = { title: '', description: '', completed: 0, total: 0, steps: [] };
}
