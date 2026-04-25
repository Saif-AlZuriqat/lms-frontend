import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ResetPassword } from './pages/reset-password/reset-password';
import { HrCreateUser } from './pages/hr-create-user/hr-create-user';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { LearningPathsPage } from './pages/course-builder/learning-paths/learning-paths';
import { CourseManagerPage } from './pages/course-builder/course-manager/course-manager';
import { LessonEditorPage } from './pages/course-builder/lesson-editor/lesson-editor';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'reset-password', component: ResetPassword },
  { path: 'learning-path', redirectTo: 'learning-paths', pathMatch: 'full' },
  { path: 'learning-path/:id', redirectTo: 'learning-paths/:id', pathMatch: 'full' },
  { path: 'learning-paths', component: LearningPathsPage, canActivate: [authGuard] },
  { path: 'learning-paths/:learningPathId', component: CourseManagerPage, canActivate: [authGuard] },
  { path: 'lessons/:lessonId/edit', component: LessonEditorPage, canActivate: [authGuard] },
  { path: 'hr/create-user', component: HrCreateUser, canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'HR'] } },
];