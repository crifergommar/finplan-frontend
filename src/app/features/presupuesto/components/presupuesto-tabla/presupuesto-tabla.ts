import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { PresupuestoService } from '../../services/presupuesto';
import { TransaccionService } from '../../../transaccion/services/transaccion';
import { Presupuesto } from '../../../../shared/models/presupuesto.model';
import { Transaccion } from '../../../../shared/models/transaccion.model';

type VistaPresupuesto = 'MENSUAL' | 'QUINCENAL';

interface MetricaPresupuesto {
  valor: number;
  variacion: string;
}

interface QuincenaResumen {
  titulo: string;
  rango: string;
  estado: 'COMPLETADO' | 'EN_CURSO' | 'PENDIENTE';
  transacciones: Transaccion[];
  subtotal: number;
}

@Component({
  selector: 'app-presupuesto-tabla',
  imports: [CommonModule],
  templateUrl: './presupuesto-tabla.html',
  styleUrl: './presupuesto-tabla.scss',
})
export class PresupuestoTabla implements OnInit {
  loading = true;
  error: string | null = null;
  vacio = false;

  readonly hoy = new Date();
  readonly mesActual = this.hoy.getMonth() + 1;
  readonly anioActual = this.hoy.getFullYear();
  readonly diasMesActual = new Date(this.anioActual, this.mesActual, 0).getDate();
  readonly meses = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  vistaActiva: VistaPresupuesto = 'QUINCENAL';
  presupuesto: Presupuesto | null = null;
  transacciones: Transaccion[] = [];
  detalleMensual: Transaccion[] = [];
  quincenas: QuincenaResumen[] = [];

  ingresosTotales: MetricaPresupuesto = { valor: 0, variacion: '0%' };
  gastosTotales: MetricaPresupuesto = { valor: 0, variacion: '0%' };
  balanceMensual: MetricaPresupuesto = { valor: 0, variacion: 'Disponible para ahorro' };
  usoPresupuesto = 0;
  gastoVsPlaneado = 'Gastado $0 de $0';

  constructor(
    private presupuestoService: PresupuestoService,
    private transaccionService: TransaccionService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.vacio = false;

    forkJoin({
      presupuesto: this.presupuestoService.getPresupuesto(this.anioActual),
      transacciones: this.transaccionService.listar(this.mesActual, this.anioActual),
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({ presupuesto, transacciones }) => {
        this.presupuesto = presupuesto;

        if (!presupuesto) {
          this.transacciones = [];
          this.detalleMensual = [];
          this.quincenas = [];
          this.vacio = true;
          return;
        }

        this.transacciones = [...transacciones].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.actualizarVista();
      },
      error: (error: Error) => {
        this.error = error.message || 'No fue posible cargar el presupuesto.';
      },
    });
  }

  seleccionarVista(vista: VistaPresupuesto): void {
    this.vistaActiva = vista;
  }

  trackByTransaccion(_: number, transaccion: Transaccion): number {
    return transaccion.id;
  }

  trackByIndice(indice: number): number {
    return indice;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  etiquetaMonto(transaccion: Transaccion): string {
    const signo = transaccion.tipo === 'INGRESO' ? '+' : '-';
    return `${signo}${this.formatearMoneda(transaccion.monto)}`;
  }

  claseMonto(transaccion: Transaccion): string {
    return transaccion.tipo === 'INGRESO' ? 'positive' : 'negative';
  }

  claseEstado(estado: QuincenaResumen['estado']): string {
    return estado.toLowerCase();
  }

  textoEstado(estado: QuincenaResumen['estado']): string {
    switch (estado) {
      case 'COMPLETADO':
        return 'Completado';
      case 'EN_CURSO':
        return 'En curso';
      default:
        return 'Pendiente';
    }
  }

  private actualizarVista(): void {
    const ingresos = this.sumarPorTipo('INGRESO');
    const gastos = this.sumarPorTipo('GASTO');
    const totalPlaneado = this.obtenerTotalPlaneadoMesActual();
    const balance = ingresos - gastos;

    this.ingresosTotales = {
      valor: ingresos,
      variacion: this.obtenerPorcentaje(ingresos, totalPlaneado),
    };

    this.gastosTotales = {
      valor: gastos,
      variacion: this.obtenerPorcentaje(gastos, totalPlaneado),
    };

    this.balanceMensual = {
      valor: balance,
      variacion: balance >= 0 ? 'Disponible para ahorro' : 'Balance ajustado',
    };

    this.usoPresupuesto = totalPlaneado > 0
      ? Math.round((gastos / totalPlaneado) * 100)
      : 0;
    this.gastoVsPlaneado = `Gastado ${this.formatearMoneda(gastos)} de ${this.formatearMoneda(totalPlaneado)}`;

    this.quincenas = [
      this.construirQuincena('Primera Quincena', 1, 15),
      this.construirQuincena('Segunda Quincena', 16, this.diasMesActual),
    ];

    this.detalleMensual = [...this.transacciones];
  }

  private construirQuincena(titulo: string, diaInicio: number, diaFin: number): QuincenaResumen {
    const transacciones = this.transacciones.filter((transaccion) => {
      const dia = new Date(`${transaccion.fecha}T00:00:00`).getDate();
      return dia >= diaInicio && dia <= diaFin;
    });

    const subtotal = transacciones.reduce((acumulado, transaccion) => {
      return acumulado + (transaccion.tipo === 'INGRESO' ? transaccion.monto : -transaccion.monto);
    }, 0);

    return {
      titulo,
      rango: `${diaInicio}-${diaFin}`,
      estado: this.obtenerEstadoQuincena(diaInicio, diaFin),
      transacciones,
      subtotal,
    };
  }

  private obtenerEstadoQuincena(diaInicio: number, diaFin: number): QuincenaResumen['estado'] {
    if (this.hoy.getFullYear() !== this.anioActual || this.hoy.getMonth() + 1 !== this.mesActual) {
      return 'COMPLETADO';
    }

    const diaActual = this.hoy.getDate();
    if (diaActual > diaFin) {
      return 'COMPLETADO';
    }
    if (diaActual >= diaInicio) {
      return 'EN_CURSO';
    }
    return 'PENDIENTE';
  }

  private obtenerTotalPlaneadoMesActual(): number {
    if (!this.presupuesto) {
      return 0;
    }

    return this.presupuesto.meses
      .filter((mes) => mes.mes === this.mesActual && mes.categoriaTipo === 'GASTO')
      .reduce((acumulado, mes) => acumulado + mes.montoPlaneado, 0);
  }

  private sumarPorTipo(tipo: Transaccion['tipo']): number {
    return this.transacciones
      .filter((transaccion) => transaccion.tipo === tipo)
      .reduce((acumulado, transaccion) => acumulado + transaccion.monto, 0);
  }

  private obtenerPorcentaje(valor: number, base: number): string {
    if (base <= 0) {
      return '0%';
    }

    return `${Math.round((valor / base) * 100)}%`;
  }
}
