import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { Presupuesto } from '../../../shared/models/presupuesto.model';
import { ApiError } from '../../../shared/models/api-error.model';

@Injectable({
  providedIn: 'root',
})
export class PresupuestoService {

  constructor(private api: ApiService) {}

  getPresupuesto(anio: number): Observable<Presupuesto | null> {
    return this.api.get<ApiResponse<Presupuesto>>(`presupuestos/${anio}`).pipe(
      map((response) => response.data),
      catchError((error: ApiError) => {
        if (error.status === 404) {
          return of(null);
        }

        return throwError(() => error);
      })
    );
  }

  obtenerPorAnio(anio: number): Observable<Presupuesto | null> {
    return this.getPresupuesto(anio);
  }
}
