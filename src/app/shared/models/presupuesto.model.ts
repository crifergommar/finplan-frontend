export interface PresupuestoMensual {
  id: number;
  mes: number;
  categoriaId: number;
  categoriaNombre: string;
  categoriaTipo: 'INGRESO' | 'GASTO';
  montoPlaneado: number;
}

export interface Presupuesto {
  id: number;
  anio: number;
  descripcion: string;
  meses: PresupuestoMensual[];
}
