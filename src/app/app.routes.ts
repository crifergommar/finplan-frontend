import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Registro } from './features/auth/components/registro/registro';
import { Login } from './features/auth/components/login/login';
import { DashboardLayout } from './shared/components/dashboard-layout/dashboard-layout';
import { DashboardHome } from './features/dashboard/components/dashboard-home/dashboard-home';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'register', component: Registro },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHome },
    ],
  },
];
