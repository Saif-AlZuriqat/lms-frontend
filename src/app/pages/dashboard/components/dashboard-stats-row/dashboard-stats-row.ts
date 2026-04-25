import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-stats-row',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-stats-row.html',
  styleUrl: './dashboard-stats-row.css'
})
export class DashboardStatsRow {
  @Input() stats = { enrolled: 0, completed: 0, progress: 0 };
}
