import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { Transaccion } from '../../../shared/models/transaccion.model';

@Injectable({ providedIn: 'root' })
export class TransaccionService {

  constructor(private api: ApiService) {}

  listar(mes: number, anio: number, tipo?: string): Observable<ApiResponse<Transaccion[]>> {
    let params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    return this.api.get<ApiResponse<Transaccion[]>>('transacciones', params);
  }

  crear(transaccion: Partial<Transaccion>): Observable<ApiResponse<Transaccion>> {
    return this.api.post<ApiResponse<Transaccion>>('transacciones', transaccion);
  }

  eliminar(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`transacciones/${id}`);
  }
}
