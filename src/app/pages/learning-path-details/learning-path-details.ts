import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LearningPathService, LearningPathResponseDto, CourseResponseDTO } from '../../services/learning-path.service';

@Component({
  selector: 'app-learning-path-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-path-details.html',
  styleUrl: './learning-path-details.css'
})
export class LearningPathDetails implements OnInit {
  pathId = signal<number | null>(null);
  path = signal<LearningPathResponseDto | null>(null);
  isLoading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private learningPathService: LearningPathService
  ) {}

  goBack() {
    this.location.back();
  }

  openCourse(course: CourseResponseDTO) {
    this.router.navigate(['/course', course.id], {
      state: { course, pathId: this.pathId() }
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.pathId.set(parseInt(idParam, 10));
      this.loadPathDetails();
    } else {
      this.isLoading.set(false);
      this.error.set('No path ID found in the URL.');
    }
  }

  loadPathDetails() {
    if (!this.pathId()) return;

    this.isLoading.set(true);
    this.learningPathService.getPathById(this.pathId()!).subscribe({
      next: (data) => {
        this.path.set(data);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(`Error ${err.status}: ${err.message}`);
        this.isLoading.set(false);
        console.error('loadPathDetails failed:', err);
      }
    });
  }
}
