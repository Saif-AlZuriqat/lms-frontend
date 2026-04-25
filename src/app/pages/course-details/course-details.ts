import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CourseResponseDTO } from '../../services/learning-path.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css'
})
export class CourseDetails implements OnInit {
  course: CourseResponseDTO | null = null;
  pathId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation() ?? history.state;
    const state = (nav as any)?.extras?.state ?? nav;
    if (state?.course) {
      this.course = state.course;
      this.pathId = state.pathId ?? null;
    }
  }
}
