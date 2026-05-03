import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { Categoria } from '../../../shared/models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {

  constructor(private api: ApiService) {}

  listar(): Observable<Categoria[]> {
    return this.api.get<ApiResponse<Categoria[]>>('categorias').pipe(
      map((response) => (response.data ?? []).filter((categoria) => categoria.activa !== false))
    );
  }
}