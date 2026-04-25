import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'learning-path',
    loadComponent: () => import('./pages/learning-path/learning-path').then(m => m.LearningPath),
    canActivate: [authGuard]
  },
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
  {
    path: 'hr/create-user',
    loadComponent: () => import('./pages/hr-create-user/hr-create-user').then(m => m.HrCreateUser),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'HR'] }
  },
];
