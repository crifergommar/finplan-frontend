import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { Presupuesto } from '../../../shared/models/presupuesto.model';
import { ApiError } from '../../../shared/models/api-error.model';

@Injectable({
  providedIn: 'root',
})
export class PresupuestoService {
  private readonly presupuestoCache = new Map<number, Observable<Presupuesto | null>>();

  constructor(private api: ApiService) {}

  getPresupuesto(anio: number): Observable<Presupuesto | null> {
    const cached = this.presupuestoCache.get(anio);
    if (cached) {
      return cached;
    }

    const request$ = this.api.get<ApiResponse<Presupuesto>>(`presupuestos/${anio}`).pipe(
      map((response) => response.data),
      catchError((error: ApiError) => {
        if (error.status === 404) {
          return of(null);
        }

        this.presupuestoCache.delete(anio);
        return throwError(() => error);
      }),
      shareReplay(1)
    );

    this.presupuestoCache.set(anio, request$);
    return request$;
  }

  obtenerPorAnio(anio: number): Observable<Presupuesto | null> {
    return this.getPresupuesto(anio);
  }
}
