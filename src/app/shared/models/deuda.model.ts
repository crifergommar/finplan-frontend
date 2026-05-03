export type EstadoDeuda = 'AL_DIA' | 'PROXIMO' | 'VENCIDA';
export type PrioridadCuota = 'ALTA' | 'MEDIA' | 'BAJA';

export interface Deuda {
  id: number;
  nombre: string;
  entidad?: string;
  montoTotal: number;
  montoPagado: number;
  numCuotas: number;
  cuotasPagadas: number;
  tasaInteres: number;
  fechaInicio: string;
  activa: boolean;
  estado?: EstadoDeuda;
  icono?: string;          // 'casa' | 'auto' | 'tarjeta' | default
  diasProximoVcto?: number;
}

export interface CuotaDeuda {
  id: number;
  deudaId: number;
  numero: number;
  monto: number;
  fechaVcto: string;
  pagada: boolean;
}

export interface PagoDeuda {
  id: number;
  cuotaId: number;
  monto: number;
  fechaPago: string;
}

export interface PagoRequest {
  cuotaId: number;
  monto: number;
  fechaPago: string;
}

export interface CalendarioItem {
  deudaId: number;
  deudaNombre: string;
  cuotaId: number;
  numeroCuota: number;
  monto: number;
  fechaVcto: string;
  pagada: boolean;
  prioridad?: PrioridadCuota;
}

/** Vista enriquecida: Deuda + cuotas cargadas + cálculos de progreso */
export interface DeudaVista extends Deuda {
  cuotas: CuotaDeuda[];
  progreso: number;
  proximaCuota: CuotaDeuda | null;
  diasParaVencimiento: number;
}
