import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TransaccionService } from '../../../transaccion/services/transaccion';
import { ReporteService } from '../../../reporte/services/reporte';
import { PresupuestoService } from '../../../presupuesto/services/presupuesto';
import { Transaccion } from '../../../../shared/models/transaccion.model';
import { ComparativoResponse } from '../../../../shared/models/reporte.model';
import { Presupuesto } from '../../../../shared/models/presupuesto.model';
import { UiService } from '../../../../core/services/ui.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome implements OnInit {

  /* ── Estado ── */
  loading = true;
  error: string | null = null;
  sinPresupuesto = false;
  descargando = false;

  /* ── Período actual ── */
  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();

  presupuesto: Presupuesto | null = null;
  comparativo: ComparativoResponse | null = null;

  /* ── Métricas ── */
  ingresosMensuales = 0;
  gastosMensuales = 0;
  balance = 0;
  totalPlaneado = 0;
  progresoPresupuesto = 0;

  /* ── Transacciones ── */
  todasTransacciones: Transaccion[] = [];
  filtroActivo: 'TODAS' | 'INGRESO' | 'GASTO' = 'TODAS';
  searchText = '';

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

  get transaccionesFiltradas(): Transaccion[] {
    const termino = this.searchText.trim().toLowerCase();

    return this.todasTransacciones
      .filter((transaccion) => {
        const coincideTipo = this.filtroActivo === 'TODAS'
          ? true
          : transaccion.tipo === this.filtroActivo;

        const coincideTexto = termino
          ? transaccion.descripcion?.toLowerCase().includes(termino) ?? false
          : true;

        return coincideTipo && coincideTexto;
      })
      .slice(0, 5);
  }

  constructor(
    private transaccionService: TransaccionService,
    private reporteService: ReporteService,
    private presupuestoService: PresupuestoService,
    private uiService: UiService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /* ── Exportar Excel ── */
  exportarExcel(): void {
    this.descargando = true;
    const mes = this.mesActual;
    const anio = this.anioActual;

    this.exportService.exportarExcel(anio, mes).subscribe({
      next: (blob) => {
        this.exportService.descargarArchivo(blob, `transacciones-${anio}-${mes}.xlsx`);
        this.descargando = false;
      },
      error: (err) => {
        console.error('Error al exportar Excel:', err);
        this.descargando = false;
      },
    });
  }

  /* ── Sidebar (delega a UiService) ── */
  toggleSidebar(): void {
    this.uiService.toggleSidebar();
  }

  /* ── Carga de datos ── */
  cargarDatos(): void {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();

    this.mesActual = mes;
    this.anioActual = anio;
    this.loading = true;
    this.error = null;
    this.sinPresupuesto = false;
    this.presupuesto = null;
    this.comparativo = null;

    // catchError individual: cada fuente falla silenciosamente — nunca bloquea forkJoin
    const transacciones$ = this.transaccionService.listar(mes, anio).pipe(
      catchError(() => of<Transaccion[]>([]))
    );

    const comparativo$ = this.reporteService.obtenerComparativo(mes, anio).pipe(
      catchError(() => of(null))
    );

    // 404 esperado si el usuario no creó presupuesto — no es error de UI
    const presupuesto$ = this.presupuestoService.getPresupuesto(anio).pipe(
      catchError(() => of(null))
    );

    forkJoin({
      transacciones: transacciones$,
      comparativo: comparativo$,
      presupuesto: presupuesto$,
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({ transacciones, comparativo, presupuesto }) => {
        this.todasTransacciones = [...transacciones];
        this.comparativo = comparativo?.data ?? null;

        if (!presupuesto) {
          this.sinPresupuesto = true;
          this.presupuesto = null;
        } else {
          this.presupuesto = presupuesto;
        }

        this.procesarTransacciones(transacciones);
        this.calcularMetricas();
      },
      error: (err: { error?: { mensaje?: string } } & Error) => {
        this.error = err?.error?.mensaje || err.message || 'Error cargando datos';
      },
    });
  }

  private procesarTransacciones(data: Transaccion[]): void {
    this.todasTransacciones = [...data].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  private calcularMetricas(): void {
    this.ingresosMensuales = this.todasTransacciones
      .filter((transaccion) => transaccion.tipo === 'INGRESO')
      .reduce((acumulado, transaccion) => acumulado + transaccion.monto, 0);

    this.gastosMensuales = this.todasTransacciones
      .filter((transaccion) => transaccion.tipo === 'GASTO')
      .reduce((acumulado, transaccion) => acumulado + transaccion.monto, 0);

    this.balance = this.ingresosMensuales - this.gastosMensuales;

    if (this.comparativo) {
      this.totalPlaneado = this.comparativo.totalPlaneado;
    } else if (this.presupuesto) {
      this.totalPlaneado = this.presupuesto.meses
        .filter((mes) => mes.mes === this.mesActual && mes.categoriaTipo === 'GASTO')
        .reduce((acumulado, mes) => acumulado + mes.montoPlaneado, 0);
    } else {
      this.totalPlaneado = 0;
    }

    this.progresoPresupuesto = this.totalPlaneado > 0
      ? Math.round((this.gastosMensuales / this.totalPlaneado) * 100)
      : 0;
  }

  /* ── Filtros ── */
  filtrar(tipo: 'TODAS' | 'INGRESO' | 'GASTO'): void {
    this.filtroActivo = tipo;
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
}
