import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Registro } from './features/auth/components/registro/registro';
import { Login } from './features/auth/components/login/login';
import { DashboardLayout } from './shared/components/dashboard-layout/dashboard-layout';
import { DashboardHome } from './features/dashboard/components/dashboard-home/dashboard-home';
import { PresupuestoTabla } from './features/presupuesto/components/presupuesto-tabla/presupuesto-tabla';
import { TransaccionLista } from './features/transaccion/components/transaccion-lista/transaccion-lista';
import { TransaccionFormComponent } from './features/transaccion/components/transaccion-form/transaccion-form';
import { AuthGuard } from './core/guards/auth.guard';
import { Contacto } from './features/contacto/contacto';
import { RegistrarPago } from './features/pagos/registrar-pago';
import { DeudaLista } from './features/deuda/components/deuda-lista/deuda-lista';
import { CalendarioComponent } from './features/calendario/components/calendario.component';
import { ReportesComponent } from './features/reportes/components/reportes.component';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'register', component: Registro },
  { path: 'login', component: Login },
  { path: 'contacto', component: Contacto },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHome },
      { path: 'presupuesto', component: PresupuestoTabla },
      { path: 'transacciones', component: TransaccionLista },
      { path: 'transacciones/nueva', component: TransaccionFormComponent, canActivate: [AuthGuard] },
      { path: 'pagos', component: RegistrarPago },
      { path: 'deudas', component: DeudaLista, canActivate: [AuthGuard] },
      { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },
      { path: 'calendario', component: CalendarioComponent, canActivate: [AuthGuard] },
    ],
  },
  
];
