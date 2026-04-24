import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ResetPassword } from './pages/reset-password/reset-password';
import { LearningPath } from './pages/learning-path/learning-path';
import { LearningPathDetails } from './pages/learning-path-details/learning-path-details';
import { HrCreateUser } from './pages/hr-create-user/hr-create-user';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'reset-password', component: ResetPassword },
  { path: 'learning-path', component: LearningPath, canActivate: [authGuard] },
  { path: 'learning-path/:id', component: LearningPathDetails, canActivate: [authGuard] },
  { path: 'hr/create-user', component: HrCreateUser, canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'HR'] } },
];