import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LearningPathResponseDto } from '../../types/course-builder.types';

@Component({
  selector: 'app-learning-path-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ path.title }}</h3>
      <p>{{ path.description || 'No description' }}</p>
      <small>{{ path.courses.length }} course(s)</small>
      <div class="actions">
        <button (click)="manage.emit(path.id)">Manage Courses</button>
        <button class="link" (click)="edit.emit(path)">✏</button>
        <button class="danger" (click)="remove.emit(path.id)">🗑</button>
      </div>
    </div>
  `,
  styles: [
    `
      .card { border: 1px solid var(--gray-200); border-radius: 12px; background: #fff; padding: 14px; display: grid; gap: 8px; }
      h3 { margin: 0; }
      p { margin: 0; color: var(--gray-600); }
      .actions { display: flex; gap: 8px; }
      button { border: none; border-radius: 8px; padding: 7px 10px; cursor: pointer; }
      .actions button:first-child { background: var(--blue); color: #fff; }
      .link { color: #3b82f6; }
      .danger { color: #ef4444; }
    `,
  ],
})
export class LearningPathCardComponent {
  @Input({ required: true }) path!: LearningPathResponseDto;
  @Output() manage = new EventEmitter<number>();
  @Output() edit = new EventEmitter<LearningPathResponseDto>();
  @Output() remove = new EventEmitter<number>();
}
