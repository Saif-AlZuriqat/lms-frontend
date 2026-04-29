import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { LearningPathsPage } from './pages/course-builder/learning-paths/learning-paths';
import { CourseManagerPage } from './pages/course-builder/course-manager/course-manager';
import { LessonEditorPage } from './pages/course-builder/lesson-editor/lesson-editor';

export const routes: Routes = [
  // ── Auth (lazy) ──────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPassword)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword),
  },

  // ── Student pages (lazy) ─────────────────────────────────
  {
    path: 'learning-path/:id',
    loadComponent: () => import('./pages/learning-path-details/learning-path-details').then(m => m.LearningPathDetails),
    canActivate: [authGuard]
  },
  {
    path: 'course/:id',
    loadComponent: () => import('./pages/course-details/course-details').then(m => m.CourseDetails),
    canActivate: [authGuard]
  },

  // ── Course Builder (admin/instructor) ────────────────────
  {
    path: 'learning-paths',
    component: LearningPathsPage,
    canActivate: [authGuard]
  },
  {
    path: 'learning-paths/:learningPathId',
    component: CourseManagerPage,
    canActivate: [authGuard]
  },
  {
    path: 'lessons/:lessonId/edit',
    component: LessonEditorPage,
    canActivate: [authGuard]
  },

  // ── HR / Admin ───────────────────────────────────────────
  {
    path: 'hr/dashboard',
    loadComponent: () => import('./pages/hr-dashboard/hr-dashboard').then(m => m.HrDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] }
  },
  {
    path: 'hr/create-user',
    loadComponent: () => import('./pages/hr-create-user/hr-create-user').then(m => m.HrCreateUser),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] }
  },

  // ── Employee ─────────────────────────────────────────────
  {
    path: 'employee/dashboard',
    loadComponent: () => import('./pages/employee-dashboard/employee-dashboard').then(m => m.EmployeeDashboard),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Employee', 'Admin'] }
  },
];
