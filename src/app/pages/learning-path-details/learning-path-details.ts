import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LearningPathService, LearningPathResponseDto } from '../../services/learning-path.service';

@Component({
  selector: 'app-learning-path-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-path-details.html',
  styleUrl: './learning-path-details.css'
})
export class LearningPathDetails implements OnInit {
  pathId: number | null = null;
  path: LearningPathResponseDto | null = null;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private learningPathService: LearningPathService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.pathId = parseInt(idParam, 10);
        this.loadPathDetails();
      }
    });
  }

  loadPathDetails() {
    if (!this.pathId) return;
    
    this.isLoading = true;
    this.learningPathService.getPathById(this.pathId).subscribe({
      next: (data) => {
        this.path = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load learning path details.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
