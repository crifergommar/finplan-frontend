import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Registro } from './features/auth/components/registro/registro';

export const routes: Routes = [
    { path: '', component: Landing},     
    { path: 'register', component: Registro }
];
