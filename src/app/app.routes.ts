import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Registro } from './features/auth/components/registro/registro';
import { Login } from './features/auth/components/login/login';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: 'register', component: Registro },
    { path: 'login', component: Login },
    { path: '**', redirectTo: '' },
];
