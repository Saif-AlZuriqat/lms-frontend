import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService, UserRole } from '../../services/auth';

@Component({
  selector: 'app-hr-create-user',
  imports: [FormsModule, RouterLink],
  templateUrl: './hr-create-user.html',
  styleUrl: './hr-create-user.css',
})
export class HrCreateUser {
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
  role: UserRole = 'Employee';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  availableRoles: UserRole[] = ['Employee'];
  currentUserRole: UserRole | null = null;
  private submitFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUserRole = this.authService.getUserRole();

    if (this.currentUserRole === 'Admin') {
      this.availableRoles = ['HR', 'Employee'];
      this.role = 'Employee';
      return;
    }

    if (this.currentUserRole === 'HR') {
      this.availableRoles = ['Employee'];
      this.role = 'Employee';
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  onCreateUser() {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {   
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.availableRoles.includes(this.role)) {
      this.errorMessage = 'You are not allowed to create this role.';
      return;
    }

    this.isSubmitting = true;
    this.submitFallbackTimer = setTimeout(() => {
      this.isSubmitting = false;
      this.errorMessage = 'Request is taking too long. Please try again.';
    }, 20000);

    this.authService
      .createUser({
        userName: this.userName.trim(),
        email: this.email.trim(),
        password: this.password,
        confirmPassword: this.confirmPassword,
        fullName: this.fullName.trim() || undefined,
        role: this.role,
      })
      .pipe(
        timeout(15000),
        finalize(() => {
          if (this.submitFallbackTimer) {
            clearTimeout(this.submitFallbackTimer);
            this.submitFallbackTimer = null;
          }
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.resetForm();
          this.successMessage = 'User created successfully.';
          this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/hr/create-user']);
          });
        },
        error: (err) => {
          this.errorMessage =
            err?.name === 'TimeoutError'
              ? 'Request timed out while creating user. Please try again.'
              : (err?.error || 'Failed to create user. Please try again.');
        },
      });
  }

  private resetForm() {
    this.userName = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.fullName = '';
    this.role = this.availableRoles.includes('Employee') ? 'Employee' : this.availableRoles[0];
  }
}
