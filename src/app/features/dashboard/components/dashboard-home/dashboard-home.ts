import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TransaccionService } from '../../../transaccion/services/transaccion';
import { ReporteService } from '../../../reporte/services/reporte';
import { Transaccion } from '../../../../shared/models/transaccion.model';
import { BalanceMensualResponse, ComparativoResponse } from '../../../../shared/models/reporte.model';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome implements OnInit {

  /* ── Estado ── */
  cargando = true;
  mensajeError = '';

  /* ── Período actual ── */
  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();

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

  get nombreMes(): string {
    return this.meses[this.mesActual] || '';
  }

  get periodoTexto(): string {
    return `01 ${this.nombreMes.substring(0, 3)} - ${this.diasEnMes()} ${this.nombreMes.substring(0, 3)}`;
  }

  constructor(
    private transaccionService: TransaccionService,
    private reporteService: ReporteService,
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
    this.cargando = true;
    this.mensajeError = '';

    forkJoin({
      transacciones: this.transaccionService.listar(this.mesActual, this.anioActual),
      balance: this.reporteService.obtenerBalanceMensual(this.mesActual, this.anioActual),
      comparativo: this.reporteService.obtenerComparativo(this.mesActual, this.anioActual),
    }).subscribe({
      next: ({ transacciones, balance, comparativo }) => {
        this.procesarBalance(balance.data);
        this.procesarComparativo(comparativo.data);
        this.procesarTransacciones(transacciones.data);
        this.cargando = false;
      },
      error: (err: Error) => {
        this.mensajeError = err.message || 'Error al cargar los datos del dashboard.';
        this.cargando = false;
      },
    });
  }

  /* ── Procesamiento ── */
  private procesarBalance(data: BalanceMensualResponse): void {
    this.ingresosMensuales = data.totalIngresos;
    this.gastosMensuales = data.totalGastos;
    this.balance = data.balance;
  }

  private procesarComparativo(data: ComparativoResponse): void {
    this.totalPlaneado = data.totalPlaneado;
    this.progresoPresupuesto = this.totalPlaneado > 0
      ? Math.round((data.totalEjecutado / this.totalPlaneado) * 100)
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
}
