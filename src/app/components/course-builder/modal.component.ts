import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="overlay" (click)="close.emit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ title }}</h3>
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
      .modal { width: min(560px, 95vw); background: white; border-radius: 12px; padding: 16px; box-shadow: var(--shadow-lg); }
      h3 { margin-bottom: 12px; font-size: 1.1rem; }
    `,
  ],
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}
