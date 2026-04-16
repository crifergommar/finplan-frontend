export interface Transaccion {
  id: number;
  categoriaId: number;
  categoriaNombre: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
  descripcion: string;
  fecha: string;
  createdAt?: string;
}

