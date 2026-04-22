import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LearningPathService, LearningPathResponseDto, LearningPathProcessDto } from '../../services/learning-path.service';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './learning-path.html',
  styleUrl: './learning-path.css'
})
export class LearningPath implements OnInit {
  paths: LearningPathResponseDto[] = [];
  
  newPath: LearningPathProcessDto = {
    title: '',
    description: ''
  };

  isLoading = false;
  error = '';

  constructor(private learningPathService: LearningPathService) {}

  ngOnInit() {
    this.loadPaths();
  }

  loadPaths() {
    this.learningPathService.getPaths().subscribe({
      next: (data) => {
        this.paths = data;
      },
      error: (err) => {
        console.error('Error loading learning paths', err);
        this.paths = [];
      }
    });
  }

  createPath() {
    if (!this.newPath.title) return;
    
    this.isLoading = true;
    this.error = '';

    this.learningPathService.addPath(this.newPath).subscribe({
      next: () => {
        this.isLoading = false;
        this.newPath = { title: '', description: '' };
        this.loadPaths();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to create learning path.';
        console.error(err);
      }
    });
  }
}
