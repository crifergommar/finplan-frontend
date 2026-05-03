import { Categoria } from './categoria.model';

export interface CrearTransaccionRequest {
  categoriaId: number;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
  descripcion: string;
  fecha: string;
}

export interface Transaccion {
  id: number;
  categoriaId: number;
  categoriaNombre: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
  descripcion: string;
  fecha: string;
  createdAt?: string;
  categoria?: Categoria;
}

