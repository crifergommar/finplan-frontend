import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface ApiResponse<T> {
  data: T;
  mensaje: string;
  status: number;
  timestamp: string;
}

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
  accessToken: string;
  tipo: string;
  email: string;
  nombre: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'finplan_token';
  private usuarioActual = new BehaviorSubject<AuthResponse | null>(null);

  usuarioActual$ = this.usuarioActual.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(credenciales: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/login', credenciales).pipe(
      tap(respuesta => {
        localStorage.setItem(this.TOKEN_KEY, respuesta.data.accessToken);
        this.usuarioActual.next(respuesta.data);
      })
    );
  }

  registro(datos: RegistroRequest): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/registro', datos).pipe(
      tap(respuesta => {
        localStorage.setItem(this.TOKEN_KEY, respuesta.data.accessToken);
        this.usuarioActual.next(respuesta.data);
      })
    );
  }

  logout(): void {
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