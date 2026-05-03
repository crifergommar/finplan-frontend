import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ExportService {

  constructor(private api: ApiService) {}

  exportarExcel(anio: number, mes: number): Observable<Blob> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.api.getBlob('export/excel', params);
  }

  descargarArchivo(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
