import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-deadlines',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-deadlines.html',
  styleUrl: './dashboard-deadlines.css'
})
export class DashboardDeadlines {
  @Input() deadlines: { title: string; date: string; urgency: string; tag: string }[] = [];
}
