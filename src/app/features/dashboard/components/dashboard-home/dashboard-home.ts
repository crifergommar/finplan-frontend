import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TransaccionService } from '../../../transaccion/services/transaccion';
import { ReporteService } from '../../../reporte/services/reporte';
import { PresupuestoService } from '../../../presupuesto/services/presupuesto';
import { Transaccion } from '../../../../shared/models/transaccion.model';
import { BalanceMensualResponse, ComparativoResponse } from '../../../../shared/models/reporte.model';
import { Presupuesto } from '../../../../shared/models/presupuesto.model';
import { UiService } from '../../../../core/services/ui.service';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { ApiError } from '../../../../shared/models/api-error.model';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome implements OnInit {

  /* ── Estado ── */
  loading = true;
  error: string | null = null;
  sinPresupuesto = false;

  /* ── Período actual ── */
  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();

  comparativo: ComparativoResponse | null = null;

  /* ── Métricas ── */
  ingresosMensuales = 0;
  gastosMensuales = 0;
  balance = 0;
  totalPlaneado = 0;
  progresoPresupuesto = 0;

  /* ── Transacciones ── */
  todasTransacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  filtroActivo: 'TODAS' | 'INGRESO' | 'GASTO' = 'TODAS';

  /* ── Helpers para template ── */
  readonly meses = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  get cargando(): boolean {
    return this.loading;
  }

  get mensajeError(): string {
    return this.error ?? '';
  }

  get nombreMes(): string {
    return this.meses[this.mesActual] || '';
  }

  get periodoTexto(): string {
    return `01 ${this.nombreMes.substring(0, 3)} - ${this.diasEnMes()} ${this.nombreMes.substring(0, 3)}`;
  }

  constructor(
    private transaccionService: TransaccionService,
    private reporteService: ReporteService,
    private presupuestoService: PresupuestoService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /* ── Sidebar (delega a UiService) ── */
  toggleSidebar(): void {
    this.uiService.toggleSidebar();
  }

  /* ── Carga de datos ── */
  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.sinPresupuesto = false;

    forkJoin({
      transacciones: this.transaccionService.listar(this.mesActual, this.anioActual).pipe(
        catchError((error: Error) => {
          this.registrarError(error, 'Error cargando transacciones');
          return of([]);
        })
      ),
      balance: this.reporteService.obtenerBalanceMensual(this.mesActual, this.anioActual).pipe(
        catchError((error: Error) => {
          this.registrarError(error, 'Error cargando balance mensual');
          return of({
            data: {
              anio: this.anioActual,
              mes: this.mesActual,
              totalIngresos: 0,
              totalGastos: 0,
              balance: 0,
            },
            mensaje: '',
            status: 200,
            timestamp: '',
          } satisfies ApiResponse<BalanceMensualResponse>);
        })
      ),
      comparativo: this.reporteService.obtenerComparativo(this.mesActual, this.anioActual).pipe(
        catchError((error: Error) => {
          this.registrarError(error, 'Error cargando comparativo');
          return of(null);
        })
      ),
      presupuesto: this.presupuestoService.getPresupuesto(this.anioActual).pipe(
        catchError((error: ApiError | Error) => {
          if (error instanceof ApiError && error.status === 404) {
            return of(null);
          }

          this.registrarError(error, 'Error cargando presupuesto');
          return of(null);
        })
      ),
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({ transacciones, balance, comparativo, presupuesto }) => {
        this.procesarBalance(balance.data);
        this.procesarTransacciones(transacciones);
        this.comparativo = comparativo?.data ?? null;
        this.procesarPresupuesto(presupuesto, this.comparativo);
      },
      error: (err: Error) => {
        this.error = err.message || 'Error al cargar los datos del dashboard.';
      },
    });
  }

  /* ── Procesamiento ── */
  private procesarBalance(data: BalanceMensualResponse): void {
    this.ingresosMensuales = data.totalIngresos;
    this.gastosMensuales = data.totalGastos;
    this.balance = data.balance;
  }

  private procesarPresupuesto(presupuesto: Presupuesto | null, comparativo: ComparativoResponse | null): void {
    if (!presupuesto) {
      this.sinPresupuesto = true;
      this.totalPlaneado = comparativo?.totalPlaneado ?? 0;
      this.progresoPresupuesto = 0;
      return;
    }

    this.totalPlaneado = comparativo?.totalPlaneado ?? presupuesto.meses
      .filter((mes) => mes.mes === this.mesActual && mes.categoriaTipo === 'GASTO')
      .reduce((acumulado, mes) => acumulado + mes.montoPlaneado, 0);

    this.progresoPresupuesto = this.totalPlaneado > 0
      ? Math.round((this.gastosMensuales / this.totalPlaneado) * 100)
      : 0;
  }

  private procesarTransacciones(data: Transaccion[]): void {
    this.todasTransacciones = data.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    this.aplicarFiltro();
  }

  /* ── Filtros ── */
  filtrar(tipo: 'TODAS' | 'INGRESO' | 'GASTO'): void {
    this.filtroActivo = tipo;
    this.aplicarFiltro();
  }

  private aplicarFiltro(): void {
    const lista = this.filtroActivo === 'TODAS'
      ? this.todasTransacciones
      : this.todasTransacciones.filter(t => t.tipo === this.filtroActivo);
    this.transaccionesFiltradas = lista.slice(0, 5);
  }

  /* ── Helpers ── */
  formatearMoneda(valor: number): string {
    const abs = Math.abs(valor);
    const formatted = '$' + abs.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return valor < 0 ? '-' + formatted : '+' + formatted;
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    const dia = d.getDate();
    const mes = this.meses[d.getMonth() + 1]?.substring(0, 3) || '';
    const anio = d.getFullYear();
    return `${dia} ${mes}, ${anio}`;
  }

  presupuestoRestante(): number {
    return Math.max(this.totalPlaneado - this.gastosMensuales, 0);
  }

  private diasEnMes(): number {
    return new Date(this.anioActual, this.mesActual, 0).getDate();
  }

  private registrarError(error: Error, fallbackMessage: string): void {
    if (!this.error) {
      this.error = error.message || fallbackMessage;
    }
  }
}
