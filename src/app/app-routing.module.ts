import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
  },
  {
    path: 'presupuesto',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/presupuesto/presupuesto-module').then(m => m.PresupuestoModule)
  },
  {
    path: 'transacciones',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/transaccion/transaccion-module').then(m => m.TransaccionModule)
  },
  {
    path: 'deudas',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/deuda/deuda-module').then(m => m.DeudaModule)
  },
  {
    path: 'alertas',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/alerta/alerta-module').then(m => m.AlertaModule)
  },
  {
    path: 'reportes',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/reporte/reporte-module').then(m => m.ReporteModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/admin/admin-module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}