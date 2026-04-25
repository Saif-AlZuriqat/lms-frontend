import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inline-add-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-wrap">
      <input [(ngModel)]="title" placeholder="Title" />
      <textarea [(ngModel)]="description" placeholder="Description"></textarea>
      <div class="actions">
        <button (click)="submitClicked()" [disabled]="!title.trim()">Save</button>
        <button class="secondary" (click)="cancel.emit()">Cancel</button>
      </div>
    </div>
  `,
  styles: [
    `
      .form-wrap { border: 1px dashed var(--gray-300); border-radius: 10px; padding: 12px; margin-top: 8px; animation: slideIn 0.2s ease-out; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      input, textarea { width: 100%; border: 1px solid var(--gray-300); border-radius: 8px; padding: 8px; margin-bottom: 8px; }
      textarea { min-height: 76px; resize: vertical; }
      .actions { display: flex; gap: 8px; }
      button { border: none; border-radius: 8px; padding: 7px 12px; background: var(--blue); color: white; cursor: pointer; }
      .secondary { background: var(--gray-200); color: var(--gray-800); }
    `,
  ],
})
export class InlineAddFormComponent {
  @Input() title = '';
  @Input() description = '';
  @Output() submit = new EventEmitter<{ title: string; description: string }>();
  @Output() cancel = new EventEmitter<void>();

  submitClicked(): void {
    this.submit.emit({ title: this.title.trim(), description: this.description.trim() });
  }
}
