import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { BalanceMensualResponse, ComparativoResponse } from '../../../shared/models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {

  constructor(private api: ApiService) {}

  obtenerBalanceMensual(mes: number, anio: number): Observable<ApiResponse<BalanceMensualResponse>> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.api.get<ApiResponse<BalanceMensualResponse>>('reportes/balance-mensual', params);
  }

  obtenerComparativo(mes: number, anio: number): Observable<ApiResponse<ComparativoResponse>> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.api.get<ApiResponse<ComparativoResponse>>('reportes/comparativo', params);
  }
}
