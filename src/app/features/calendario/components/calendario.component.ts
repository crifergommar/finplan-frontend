import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { DeudaService } from '../../deuda/services/deuda';
import { CalendarioItem } from '../../../shared/models/deuda.model';

interface EventoCalendario {
  cuotaId: number;
  descripcion: string;
  monto: number;
  pagada: boolean;
  colorIndex: number;
}

interface DiaCalendario {
  numero: number;   // 1–31, 0 = celda de relleno
  esHoy: boolean;
  eventos: EventoCalendario[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss',
})
export class CalendarioComponent implements OnInit {

  mes!: number;
  anio!: number;
  diasDelMes: DiaCalendario[] = [];
  totalMes = 0;
  totalPagado = 0;
  pendientes = 0;
  loading = false;
  error: string | null = null;
  tabActivo: 'lista' | 'mensual' | 'anual' = 'mensual';

  readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  readonly DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

  private readonly COLORES = ['verde', 'azul', 'morado', 'naranja', 'indigo', 'rosa'];
  private colorMap = new Map<number, number>();
  private colorCounter = 0;

  constructor(private deudaService: DeudaService) {}

  ngOnInit(): void {
    const now = new Date();
    this.mes = now.getMonth() + 1;
    this.anio = now.getFullYear();
    this.cargarCalendario();
  }

  cargarCalendario(): void {
    this.loading = true;
    this.error = null;

    this.deudaService.obtenerCalendario(this.mes, this.anio).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: (items) => {
        this.totalMes    = items.reduce((s, i) => s + i.monto, 0);
        this.totalPagado = items.filter(i => i.pagada).reduce((s, i) => s + i.monto, 0);
        this.pendientes  = items.filter(i => !i.pagada).length;
        this.diasDelMes  = this.construirMatrizDias(items);
      },
      error: () => {
        this.error = 'No se pudo cargar el calendario. Intenta de nuevo.';
      },
    });
  }

  irHoy(): void {
    const now = new Date();
    this.mes  = now.getMonth() + 1;
    this.anio = now.getFullYear();
    this.cargarCalendario();
  }

  siguienteMes(): void {
    if (this.mes === 12) { this.mes = 1; this.anio++; } else { this.mes++; }
    this.cargarCalendario();
  }

  mesAnterior(): void {
    if (this.mes === 1) { this.mes = 12; this.anio--; } else { this.mes--; }
    this.cargarCalendario();
  }

  colorClass(idx: number): string {
    return this.COLORES[idx % this.COLORES.length];
  }

  // Pre-computa la matriz UNA VEZ por carga — nunca en el template
  private construirMatrizDias(items: CalendarioItem[]): DiaCalendario[] {
    const primerDia = new Date(this.anio, this.mes - 1, 1).getDay(); // 0 = Dom
    const ultimoDia = new Date(this.anio, this.mes, 0).getDate();

    const hoy = new Date();
    const esEsteMes =
      hoy.getMonth() + 1 === this.mes && hoy.getFullYear() === this.anio;

    // Mapa día → items para búsqueda O(1)
    const mapa = new Map<number, CalendarioItem[]>();
    for (const it of items) {
      const dia = new Date(it.fechaVcto + 'T00:00:00').getDate();
      if (!mapa.has(dia)) { mapa.set(dia, []); }
      mapa.get(dia)!.push(it);
    }

    const dias: DiaCalendario[] = [];

    // Celdas vacías de relleno
    for (let i = 0; i < primerDia; i++) {
      dias.push({ numero: 0, esHoy: false, eventos: [] });
    }

    for (let d = 1; d <= ultimoDia; d++) {
      const rawItems = mapa.get(d) ?? [];
      const eventos: EventoCalendario[] = rawItems.map(it => ({
        cuotaId: it.cuotaId,
        descripcion: it.deudaNombre,
        monto: it.monto,
        pagada: it.pagada,
        colorIndex: this.getColorIndex(it.deudaId),
      }));
      dias.push({ numero: d, esHoy: esEsteMes && d === hoy.getDate(), eventos });
    }

    return dias;
  }

  private getColorIndex(deudaId: number): number {
    if (!this.colorMap.has(deudaId)) {
      this.colorMap.set(deudaId, this.colorCounter % this.COLORES.length);
      this.colorCounter++;
    }
    return this.colorMap.get(deudaId)!;
  }
}