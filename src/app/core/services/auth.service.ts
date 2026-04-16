import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
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
      }),

      catchError(error => {
        // Extraer mensaje real del backend si existe
        const mensajeBackend = error?.error?.mensaje || error?.error?.message;
        let mensajeAmigable: string;

        if (mensajeBackend) {
          mensajeAmigable = mensajeBackend;
        } else if (error.status === 401) {
          mensajeAmigable = 'Correo o contraseña incorrectos. ¡Revisa bien!';
        } else if (error.status === 403) {
          mensajeAmigable = 'Tu cuenta está desactivada o no tienes acceso.';
        } else if (error.status === 400) {
          mensajeAmigable = 'Datos inválidos. Verifica tu correo y contraseña.';
        } else if (error.status === 500) {
          mensajeAmigable = 'Error en el servidor. Intenta en un momento.';
        } else if (error.status === 0) {
          mensajeAmigable = 'No hay conexión con el servidor. Verifica tu internet.';
        } else {
          mensajeAmigable = '¡Ups! Algo salió mal. Intenta de nuevo.';
        }

        return throwError(() => new Error(mensajeAmigable));
      })
    );
  }

  registro(datos: RegistroRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/registro', datos).pipe(
      tap(resp => {
        localStorage.setItem(this.TOKEN_KEY, resp.data.accessToken);
        this.usuarioActual.next(resp.data);
      }),
      catchError(error => {
        const mensajeBackend = error?.error?.mensaje || error?.error?.message;
        let mensajeAmigable: string;

        if (mensajeBackend) {
          mensajeAmigable = mensajeBackend;
        } else if (error.status === 409) {
          mensajeAmigable = 'Este correo ya está registrado.';
        } else if (error.status === 400) {
          mensajeAmigable = 'Datos inválidos. Verifica la información.';
        } else if (error.status === 500) {
          mensajeAmigable = 'Error en el servidor. Intenta en un momento.';
        } else if (error.status === 0) {
          mensajeAmigable = 'No hay conexión con el servidor. Verifica tu internet.';
        } else {
          mensajeAmigable = '¡Ups! Algo salió mal. Intenta de nuevo.';
        }

        return throwError(() => new Error(mensajeAmigable));
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
