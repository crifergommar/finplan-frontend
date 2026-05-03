import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { ReporteService } from '../../reporte/services/reporte';
import { TransaccionService } from '../../transaccion/services/transaccion';
import {
  BalanceMensualResponse,
  CategoriaComparativo,
  ComparativoResponse,
} from '../../../shared/models/reporte.model';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit, OnDestroy {

  /* ── Filtros ── */
  mes!: number;
  anio!: number;

  readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  readonly ANIOS = [2023, 2024, 2025, 2026];

  /* ── Datos ── */
  balance: BalanceMensualResponse | null = null;
  comparativo: ComparativoResponse | null = null;

  /* ── Estado UI ── */
  loading = false;
  error: string | null = null;

  /* ── Chart.js ── */
  @ViewChild('graficaCanvas') graficaCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  constructor(
    private reporteService: ReporteService,
    private transaccionService: TransaccionService,
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.mes  = now.getMonth() + 1;
    this.anio = now.getFullYear();
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error   = null;
    // Destruir gráfica previa para evitar canvas leak
    this.chart?.destroy();
    this.chart = null;

    forkJoin({
      balance: this.reporteService.obtenerBalanceMensual(this.mes, this.anio).pipe(
        map((r) => r.data),
        catchError(() => of(null)),
      ),
      comparativo: this.reporteService.obtenerComparativo(this.mes, this.anio).pipe(
        map((r) => r.data),
        catchError(() => of(null)),
      ),
    }).pipe(
      finalize(() => { this.loading = false; }),
    ).subscribe({
      next: ({ balance, comparativo }) => {
        this.balance     = balance;
        this.comparativo = comparativo;
        // Renderizar después de que Angular actualice la vista
        if (comparativo?.categorias?.length) {
          setTimeout(() => this.renderizarGrafica(comparativo!), 0);
        }
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes. Intenta de nuevo.';
      },
    });
  }

  onFiltroChange(): void {
    this.cargarDatos();
  }

  private renderizarGrafica(data: ComparativoResponse): void {
    this.chart?.destroy();
    const ctx = this.graficaCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const labels = data.categorias.map((c: CategoriaComparativo) => c.nombre);
    const planeado  = data.categorias.map((c: CategoriaComparativo) => c.planeado);
    const ejecutado = data.categorias.map((c: CategoriaComparativo) => c.ejecutado);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Planeado',
            data: planeado,
            backgroundColor: '#16a34a',
            borderRadius: 4,
          },
          {
            label: 'Ejecutado',
            data: ejecutado,
            backgroundColor: '#dc2626',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: $${Number(ctx.raw).toLocaleString('es-CO')}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => `$${Number(v).toLocaleString('es-CO')}`,
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}