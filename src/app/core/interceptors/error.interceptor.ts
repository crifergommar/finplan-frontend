import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../../shared/models/api-error.model';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.authService.estaAutenticado()) {
          this.authService.cerrarSesionLocal();
        }

        const mensaje = error.error?.mensaje || error.error?.message || 'Error inesperado del servidor';
        return throwError(() => new ApiError(error.status, mensaje, error.error));
      })
    );
  }
}