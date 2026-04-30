import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout, debounceTime, distinctUntilChanged, Subject, switchMap, catchError, of } from 'rxjs';
import { AuthService, UserRole } from '../../services/auth';
import { EnrollmentService, UserSearchResult } from '../../services/enrollment.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-hr-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hr-create-user.html',
  styleUrl: './hr-create-user.css',
})
export class HrCreateUser implements OnInit {

  // ── Employee list ────────────────────────────────────────
  users = signal<UserSearchResult[]>([]);
  isLoadingUsers = signal(false);
  userSearch = '';
  private userSearch$ = new Subject<string>();

  // ── Create user form (original logic preserved) ──────────
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
    private enrollmentService: EnrollmentService,
    private activityService: ActivityService,
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

    this.router.navigate(['/hr/dashboard']);
  }

  ngOnInit() {
    this.loadUsers('');

    this.userSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        this.isLoadingUsers.set(true);
        return this.enrollmentService.searchUsers(q).pipe(catchError(() => of([])));
      })
    ).subscribe(results => {
      this.users.set(results);
      this.isLoadingUsers.set(false);
    });
  }

  private loadUsers(q: string) {
    this.isLoadingUsers.set(true);
    this.enrollmentService.searchUsers(q).pipe(
      catchError(() => of([]))
    ).subscribe(results => {
      this.users.set(results);
      this.isLoadingUsers.set(false);
    });
  }

  onUserSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.userSearch = q;
    this.userSearch$.next(q);
  }

  getRoleBadgeClass(role?: string): string {
    switch ((role ?? '').toLowerCase()) {
      case 'admin':    return 'badge-admin';
      case 'hr':       return 'badge-hr';
      default:         return 'badge-employee';
    }
  }

  // ── Original create user logic ────────────────────────────
  onCreateUser() {
    if (this.isSubmitting) return;

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
          const createdName = this.userName.trim();
          this.activityService.log(
            'person_add',
            `<strong>${this.authService.getUserName() || 'Admin'}</strong> created a new user account for <strong>${createdName}</strong>.`,
            'User Management'
          );
          this.resetForm();
          this.successMessage = 'User created successfully.';
          // Original pattern: navigate away and back to re-initialise the component
          this.router.navigateByUrl('/hr/dashboard', { skipLocationChange: true }).then(() => {
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
