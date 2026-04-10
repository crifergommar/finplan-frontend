export interface CategoriaComparativo {
  categoriaId: number;
  nombre: string;
  tipo: 'INGRESO' | 'GASTO';
  planeado: number;
  ejecutado: number;
  diferencia: number;
  excedido: boolean;
}

export interface ComparativoResponse {
  anio: number;
  mes: number;
  categorias: CategoriaComparativo[];
  totalPlaneado: number;
  totalEjecutado: number;
}

export interface BalanceMensualResponse {
  anio: number;
  mes: number;
  totalIngresos: number;
  totalGastos: number;
  balance: number;
}

