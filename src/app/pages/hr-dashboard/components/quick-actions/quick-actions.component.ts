import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

/**
 * Presentational component displaying a grid of HR shortcuts.
 * Allows quick navigation to user creation, path assignment, course assignment, and team progress.
 */
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css',
})
export class QuickActionsComponent {
  private authService = inject(AuthService);

  canApproveExtensions(): boolean {
    const role = this.authService.getUserRole();
    return role === 'SUPERADMIN' || role === 'HR';
  }
}
