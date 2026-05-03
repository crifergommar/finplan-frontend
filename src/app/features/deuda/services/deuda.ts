import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { CalendarioItem, CuotaDeuda, Deuda, PagoDeuda, PagoRequest } from '../../../shared/models/deuda.model';

@Injectable({
  providedIn: 'root',
})
export class DeudaService {

  constructor(private api: ApiService) {}

  listar(): Observable<Deuda[]> {
    return this.api.get<ApiResponse<Deuda[]>>('deudas').pipe(
      map((r) => r.data ?? [])
    );
  }

  listarActivas(): Observable<Deuda[]> {
    return this.listar();
  }

  obtenerCuotas(deudaId: number): Observable<CuotaDeuda[]> {
    return this.api.get<ApiResponse<CuotaDeuda[]>>(`deudas/${deudaId}/cuotas`).pipe(
      map((r) => r.data ?? [])
    );
  }

  registrarPago(deudaId: number, pago: PagoRequest): Observable<PagoDeuda> {
    return this.api.post<ApiResponse<PagoDeuda>>(`deudas/${deudaId}/pagos`, pago).pipe(
      map((r) => r.data)
    );
  }

  obtenerCalendario(mes: number, anio: number): Observable<CalendarioItem[]> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.api.get<ApiResponse<CalendarioItem[]>>('deudas/calendario', params).pipe(
      map((r) => r.data ?? [])
    );
  }
}
