import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { CategoriaService } from '../../features/categoria/services/categoria';
import { Categoria } from '../../shared/models/categoria.model';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ApiError } from '../../shared/models/api-error.model';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'finplan_token';
  private readonly platformId = inject(PLATFORM_ID);
  private usuarioActual = new BehaviorSubject<AuthResponse | null>(null);

  usuarioActual$ = this.usuarioActual.asObservable();

  constructor(
    private api: ApiService,
    private router: Router,
    private categoriaService: CategoriaService
  ) {}


  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/login', credenciales).pipe(
      map((response) => response.data),
      tap((usuario) => {
        this.guardarToken(usuario.accessToken);
        this.usuarioActual.next(usuario);
        this.asegurarCategoriaOtros();
      }),
      catchError((error: unknown) => throwError(() => this.normalizarErrorAuth(error)))
    );
  }

  private asegurarCategoriaOtros(): void {
    this.categoriaService.listar().pipe(
      switchMap((categorias: Categoria[]) => {
        const existe = categorias.some(
          (c) => c.nombre === 'Otros' && c.tipo === 'GASTO'
        );
        return existe
          ? of(null)
          : this.categoriaService.crear({ nombre: 'Otros', tipo: 'GASTO' }).pipe(
              catchError(() => of(null))
            );
      }),
      catchError(() => of(null))
    ).subscribe();
  }

  registro(datos: RegistroRequest): Observable<AuthResponse> {
    return this.api.post<ApiResponse<AuthResponse>>('auth/registro', datos).pipe(
      map((response) => response.data),
      tap((usuario) => {
        this.guardarToken(usuario.accessToken);
        this.usuarioActual.next(usuario);
      }),
      catchError((error: unknown) => throwError(() => this.normalizarErrorAuth(error)))
    );
  }

  logout(): void {
    this.api.post('auth/logout', {}).subscribe({ error: () => {} });
    this.cerrarSesionLocal();
  }

  cerrarSesionLocal(): void {
    this.eliminarToken();
    this.usuarioActual.next(null);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private guardarToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private eliminarToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  private normalizarErrorAuth(error: unknown): Error {
    if (error instanceof ApiError) {
      if (error.message) {
        return new Error(error.message);
      }

      switch (error.status) {
        case 401:
          return new Error('Correo o contraseña incorrectos.');
        case 403:
          return new Error('Tu cuenta está desactivada o no tienes acceso.');
        case 409:
          return new Error('Este correo ya está registrado.');
        case 400:
          return new Error('Datos inválidos. Verifica la información.');
        case 0:
          return new Error('No hay conexión con el servidor.');
        default:
          return new Error('Error al procesar la autenticación.');
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Error al procesar la autenticación.');
  }
}
