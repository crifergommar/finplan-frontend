import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { CrearTransaccionRequest, Transaccion } from '../../../shared/models/transaccion.model';

@Injectable({ providedIn: 'root' })
export class TransaccionService {

  constructor(private api: ApiService) {}

  listar(mes: number, anio: number, tipo?: string): Observable<Transaccion[]> {
    let params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    return this.api.get<ApiResponse<Transaccion[]>>('transacciones', params).pipe(
      map((response) => response.data ?? [])
    );
  }

  crear(transaccion: CrearTransaccionRequest): Observable<Transaccion> {
    return this.api.post<ApiResponse<Transaccion>>('transacciones', transaccion).pipe(
      map((response) => response.data)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<ApiResponse<null>>(`transacciones/${id}`).pipe(
      map(() => undefined)
    );
  }
}
