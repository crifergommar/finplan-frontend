import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';

/* ── Interfaces de request ── */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
}

/* ── Respuesta del backend (dentro de ApiResponse.data) ── */
export interface AuthResponse {
  accessToken: string;
  tipo: string;
  email: string;
  nombre: string;
  rol: string;
}

/* ── Envelope genérico del backend ── */
export interface ApiResponse<T> {
  data: T;
  mensaje: string;
  status: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'finplan_token';
  private usuarioActual = new BehaviorSubject<AuthResponse | null>(null);

  usuarioActual$ = this.usuarioActual.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(credenciales: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/login', credenciales).pipe(
      tap(resp => {
        localStorage.setItem(this.TOKEN_KEY, resp.data.accessToken);
        this.usuarioActual.next(resp.data);
      })
    );
  }

  registro(datos: RegistroRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/registro', datos).pipe(
      tap(resp => {
        localStorage.setItem(this.TOKEN_KEY, resp.data.accessToken);
        this.usuarioActual.next(resp.data);
      })
    );
  }

  logout(): void {
    this.api.post('auth/logout', {}).subscribe({ error: () => {} });
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioActual.next(null);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
}
