import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'finplan_token';
  private usuarioActual = new BehaviorSubject<AuthResponse | null>(null);

  usuarioActual$ = this.usuarioActual.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credenciales).pipe(
      tap(respuesta => {
        localStorage.setItem(this.TOKEN_KEY, respuesta.token);
        this.usuarioActual.next(respuesta);
      })
    );
  }

  registro(datos: RegistroRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/registro', datos).pipe(
      tap(respuesta => {
        localStorage.setItem(this.TOKEN_KEY, respuesta.token);
        this.usuarioActual.next(respuesta);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioActual.next(null);
    this.router.navigate(['/auth/login']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
}