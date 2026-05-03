import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { DeudaService } from '../../services/deuda';
import { PagoForm } from '../pago-form/pago-form';
import {
  CalendarioItem,
  CuotaDeuda,
  Deuda,
  DeudaVista,
  EstadoDeuda,
} from '../../../../shared/models/deuda.model';

@Component({
  selector: 'app-deuda-lista',
  imports: [CommonModule, PagoForm],
  templateUrl: './deuda-lista.html',
  styleUrl: './deuda-lista.scss',
})
export class DeudaLista implements OnInit {

  /* ── Estado ── */
  loading = true;
  error: string | null = null;

  /* ── Datos ── */
  deudas: DeudaVista[] = [];
  calendario: CalendarioItem[] = [];

  /* ── Modal ── */
  deudaSeleccionada: DeudaVista | null = null;
  mostrarModal = false;

  /* ── Tabs ── */
  tabActivo: 'deudas' | 'calendario' = 'deudas';

  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();

  constructor(private deudaService: DeudaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;

    const deudas$ = this.deudaService.listar().pipe(catchError(() => of([])));
    const calendario$ = this.deudaService
      .obtenerCalendario(this.mesActual, this.anioActual)
      .pipe(catchError(() => of([])));

    forkJoin({ deudas: deudas$, calendario: calendario$ })
      .pipe(
        switchMap(({ deudas, calendario }) => {
          this.calendario = calendario
            .filter((c) => !c.pagada)
            .sort(
              (a, b) =>
                new Date(a.fechaVcto).getTime() - new Date(b.fechaVcto).getTime()
            );

          if ((deudas as Deuda[]).length === 0) return of([] as DeudaVista[]);

          return forkJoin(
            (deudas as Deuda[]).map((d) =>
              this.deudaService.obtenerCuotas(d.id).pipe(
                catchError(() => of([] as CuotaDeuda[])),
                map((cuotas) => this.enriquecerDeuda(d, cuotas))
              )
            )
          );
        }),
        finalize(() => {
          this.loading = false;
        }),
        catchError((err) => {
          this.error = 'Error al cargar deudas';
          console.error(err);
          return of([]);
        })
      )
      .subscribe((deudas) => {
        this.deudas = deudas as DeudaVista[];
      });
  }

  private enriquecerDeuda(deuda: Deuda, cuotas: CuotaDeuda[]): DeudaVista {
    const pagadas = cuotas.filter((c) => c.pagada);
    const pendientes = cuotas
      .filter((c) => !c.pagada)
      .sort(
        (a, b) =>
          new Date(a.fechaVcto).getTime() - new Date(b.fechaVcto).getTime()
      );

    const cuotasPagadas = deuda.cuotasPagadas ?? pagadas.length;
    const montoPagado =
      deuda.montoPagado ?? pagadas.reduce((s, c) => s + c.monto, 0);
    const total = cuotas.length || deuda.numCuotas || 1;
    const progreso = Math.min(Math.round((cuotasPagadas / total) * 100), 100);

    const proximaCuota = pendientes[0] ?? null;
    let diasParaVencimiento = Infinity;
    let estado: EstadoDeuda = deuda.estado ?? 'AL_DIA';

    if (proximaCuota) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vcto = new Date(proximaCuota.fechaVcto + 'T00:00:00');
      diasParaVencimiento = Math.ceil(
        (vcto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diasParaVencimiento < 0) estado = 'VENCIDA';
      else if (diasParaVencimiento <= 7) estado = 'PROXIMO';
      else estado = 'AL_DIA';
    }

    return {
      ...deuda,
      cuotas,
      cuotasPagadas,
      montoPagado,
      progreso,
      estado,
      proximaCuota,
      diasParaVencimiento,
    };
  }

  abrirModalPago(deuda: DeudaVista): void {
    this.deudaSeleccionada = deuda;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.deudaSeleccionada = null;
  }

  onPagoRegistrado(): void {
    this.cerrarModal();
    this.cargarDatos();
  }

  /* ── Helpers de estado ── */
  textoVencimiento(deuda: DeudaVista): string {
    if (!deuda.proximaCuota) return 'Sin cuotas pendientes';
    const dias = deuda.diasParaVencimiento;
    if (dias === Infinity) return '';
    if (dias < 0)
      return `Vendida hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    return `Vence en ${dias} días`;
  }

  badgeLabel(estado?: EstadoDeuda): string {
    const mapa: Record<EstadoDeuda, string> = {
      AL_DIA: 'AL DÍA', PROXIMO: 'PRÓXIMO', VENCIDA: 'VENCIDA',
    };
    return estado ? (mapa[estado] ?? estado) : 'AL DÍA';
  }

  badgeClass(estado?: EstadoDeuda): string {
    const mapa: Record<EstadoDeuda, string> = {
      AL_DIA: 'badge-aldia', PROXIMO: 'badge-proximo', VENCIDA: 'badge-vencida',
    };
    return estado ? (mapa[estado] ?? 'badge-aldia') : 'badge-aldia';
  }

  barraClass(estado?: EstadoDeuda): string {
    if (estado === 'VENCIDA') return 'bar-roja';
    if (estado === 'PROXIMO') return 'bar-naranja';
    return 'bar-verde';
  }

  iconoClass(icono?: string): string {
    const mapa: Record<string, string> = {
      casa: 'fa-house', auto: 'fa-car', tarjeta: 'fa-credit-card',
    };
    return icono ? (mapa[icono] ?? 'fa-landmark') : 'fa-landmark';
  }

  prioridadClass(p?: string): string {
    if (p === 'ALTA') return 'prio-alta';
    if (p === 'BAJA') return 'prio-baja';
    return 'prio-media';
  }

  prioridadLabel(p?: string): string {
    if (p === 'ALTA') return 'Alta';
    if (p === 'BAJA') return 'Baja';
    return 'Media';
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
  }
}
