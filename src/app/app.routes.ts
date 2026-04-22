import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ResetPassword } from './pages/reset-password/reset-password';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'reset-password', component: ResetPassword },
];