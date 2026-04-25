import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-top-bar.html',
  styleUrl: './dashboard-top-bar.css'
})
export class DashboardTopBar {
  @Input() userName = '';
  @Output() logoutClick = new EventEmitter<void>();
}
