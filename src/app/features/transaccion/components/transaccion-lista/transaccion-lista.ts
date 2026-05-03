import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { CategoriaService } from '../../../categoria/services/categoria';
import { TransaccionService } from '../../services/transaccion';
import { Categoria } from '../../../../shared/models/categoria.model';
import { CrearTransaccionRequest, Transaccion } from '../../../../shared/models/transaccion.model';

type FiltroTipo = 'TODAS' | 'INGRESO' | 'GASTO';

interface ResumenTransacciones {
  ingresos: number;
  gastos: number;
  balance: number;
}

@Component({
  selector: 'app-transaccion-lista',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaccion-lista.html',
  styleUrl: './transaccion-lista.scss',
})
export class TransaccionLista implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly transaccionService = inject(TransaccionService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly filtros$ = new Subject<{ mes: number; anio: number }>();

  loading = true;
  guardando = false;
  error: string | null = null;
  mensajeExito = '';
  vacio = false;
  modalAbierto = false;
  transaccionAEliminar: Transaccion | null = null;

  readonly hoy = new Date();
  readonly meses = [
    { valor: 1, etiqueta: 'Enero' },
    { valor: 2, etiqueta: 'Febrero' },
    { valor: 3, etiqueta: 'Marzo' },
    { valor: 4, etiqueta: 'Abril' },
    { valor: 5, etiqueta: 'Mayo' },
    { valor: 6, etiqueta: 'Junio' },
    { valor: 7, etiqueta: 'Julio' },
    { valor: 8, etiqueta: 'Agosto' },
    { valor: 9, etiqueta: 'Septiembre' },
    { valor: 10, etiqueta: 'Octubre' },
    { valor: 11, etiqueta: 'Noviembre' },
    { valor: 12, etiqueta: 'Diciembre' },
  ];
  readonly aniosDisponibles = this.crearAniosDisponibles();

  filtroMes = this.hoy.getMonth() + 1;
  filtroAnio = this.hoy.getFullYear();
  filtroTipo: FiltroTipo = 'TODAS';

  categorias: Categoria[] = [];
  categoriasDisponibles: Categoria[] = [];
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  resumen: ResumenTransacciones = { ingresos: 0, gastos: 0, balance: 0 };

  readonly formulario = this.fb.group({
    tipo: this.fb.nonNullable.control<'INGRESO' | 'GASTO'>('GASTO', { validators: [Validators.required] }),
    categoriaId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    monto: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    descripcion: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.maxLength(255)] }),
    fecha: this.fb.nonNullable.control(this.formatearFechaInput(this.hoy), { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.formulario.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarCategoriasDisponibles());

    this.configurarFiltros();
    this.cargarCategorias();
    this.solicitarCargaTransacciones();
  }

  abrirModal(): void {
    this.modalAbierto = true;
    this.error = null;
    this.mensajeExito = '';
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.formulario.reset({
      tipo: 'GASTO',
      categoriaId: null,
      monto: null,
      descripcion: '',
      fecha: this.formatearFechaInput(this.hoy),
    });
    this.actualizarCategoriasDisponibles();
  }

  cambiarFiltroTipo(tipo: FiltroTipo): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  actualizarMes(mes: string): void {
    this.filtroMes = this.normalizarMes(mes);
    this.solicitarCargaTransacciones();
  }

  actualizarAnio(anio: string): void {
    this.filtroAnio = this.normalizarAnio(anio);
    this.solicitarCargaTransacciones();
  }

  guardarTransaccion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mensajeExito = '';

    const valor = this.formulario.getRawValue();
    const payload: CrearTransaccionRequest = {
      categoriaId: Number(valor.categoriaId),
      monto: Number(valor.monto),
      tipo: valor.tipo,
      descripcion: valor.descripcion.trim(),
      fecha: valor.fecha,
    };

    this.transaccionService.crear(payload).pipe(
      switchMap(() => this.cargarTransacciones()),
      finalize(() => {
        this.guardando = false;
      })
    ).subscribe({
      next: () => {
        this.cerrarModal();
        this.mensajeExito = 'Transacción guardada correctamente.';
      },
      error: (error: Error) => {
        this.error = error.message || 'No fue posible guardar la transacción.';
      },
    });
  }

  solicitarEliminacion(transaccion: Transaccion): void {
    this.transaccionAEliminar = transaccion;
    this.error = null;
    this.mensajeExito = '';
  }

  cancelarEliminacion(): void {
    this.transaccionAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.transaccionAEliminar) {
      return;
    }

    const id = this.transaccionAEliminar.id;
    this.guardando = true;
    this.error = null;
    this.mensajeExito = '';

    this.transaccionService.eliminar(id).pipe(
      tap(() => {
        this.transaccionAEliminar = null;
      }),
      switchMap(() => this.cargarTransacciones()),
      finalize(() => {
        this.guardando = false;
      })
    ).subscribe({
      next: () => {
        this.mensajeExito = 'Transacción eliminada correctamente.';
      },
      error: (error: Error) => {
        console.error('Error al eliminar transacción:', error);
        this.error = error.message || 'No fue posible eliminar la transacción.';
      },
    });
  }

  trackByTransaccion(_: number, transaccion: Transaccion): number {
    return transaccion.id;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    const valor = new Date(`${fecha}T00:00:00`);
    const dia = valor.getDate().toString().padStart(2, '0');
    const mes = this.meses[valor.getMonth()]?.etiqueta.slice(0, 3) || '';
    return `${dia} ${mes} ${valor.getFullYear()}`;
  }

  etiquetaMonto(transaccion: Transaccion): string {
    const signo = transaccion.tipo === 'INGRESO' ? '+' : '-';
    return `${signo}${this.formatearMoneda(transaccion.monto)}`;
  }

  claseMonto(transaccion: Transaccion): string {
    return transaccion.tipo === 'INGRESO' ? 'positive' : 'negative';
  }

  esInvalido(controlName: 'categoriaId' | 'monto' | 'descripcion' | 'fecha'): boolean {
    const control = this.formulario.controls[controlName];
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private procesarTransacciones(transacciones: Transaccion[]): void {
    this.transacciones = [...transacciones].sort(
      (actual, siguiente) => new Date(siguiente.fecha).getTime() - new Date(actual.fecha).getTime()
    );
    this.vacio = this.transacciones.length === 0;
    this.aplicarFiltros();
    this.calcularTotales();
  }

  private aplicarFiltros(): void {
    this.transaccionesFiltradas = this.filtroTipo === 'TODAS'
      ? [...this.transacciones]
      : this.transacciones.filter((transaccion) => transaccion.tipo === this.filtroTipo);
  }

  private calcularTotales(): void {
    const ingresos = this.transacciones
      .filter((transaccion) => transaccion.tipo === 'INGRESO')
      .reduce((total, transaccion) => total + transaccion.monto, 0);

    const gastos = this.transacciones
      .filter((transaccion) => transaccion.tipo === 'GASTO')
      .reduce((total, transaccion) => total + transaccion.monto, 0);

    this.resumen = {
      ingresos,
      gastos,
      balance: ingresos - gastos,
    };
  }

  private actualizarCategoriasDisponibles(): void {
    const tipo = this.formulario.controls.tipo.value;
    this.categoriasDisponibles = this.categorias.filter((categoria) => categoria.tipo === tipo);

    const categoriaActual = this.formulario.controls.categoriaId.value;
    if (!this.categoriasDisponibles.some((categoria) => categoria.id === categoriaActual)) {
      this.formulario.controls.categoriaId.setValue(this.categoriasDisponibles[0]?.id ?? null);
    }
  }

  private crearAniosDisponibles(): number[] {
    const anioActual = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, indice) => anioActual - 2 + indice);
  }

  private cargarTransacciones(): Observable<Transaccion[]> {
    return this.transaccionService.listar(this.filtroMes, this.filtroAnio).pipe(
      tap((transacciones) => {
        this.procesarTransacciones(transacciones);
      })
    );
  }

  private configurarFiltros(): void {
    this.filtros$.pipe(
      map(({ mes, anio }) => ({
        mes: this.normalizarMes(mes),
        anio: this.normalizarAnio(anio),
      })),
      debounceTime(300),
      distinctUntilChanged((anterior, actual) => anterior.mes === actual.mes && anterior.anio === actual.anio),
      tap(({ mes, anio }) => {
        this.filtroMes = mes;
        this.filtroAnio = anio;
        this.loading = true;
        this.error = null;
        this.vacio = false;
      }),
      switchMap(() => this.cargarTransacciones().pipe(
        catchError((error: Error) => {
          this.transacciones = [];
          this.transaccionesFiltradas = [];
          this.calcularTotales();
          this.error = error.message || 'No fue posible cargar las transacciones.';
          return EMPTY;
        }),
        finalize(() => {
          this.loading = false;
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private cargarCategorias(): void {
    this.categoriaService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categorias) => {
          this.categorias = categorias;
          this.actualizarCategoriasDisponibles();
        },
        error: (error: Error) => {
          this.error = error.message || 'No fue posible cargar las categorías.';
        },
      });
  }

  private solicitarCargaTransacciones(): void {
    this.filtros$.next({ mes: this.filtroMes, anio: this.filtroAnio });
  }

  private normalizarMes(valor: string | number): number {
    const numero = Number(valor);
    if (!Number.isNaN(numero) && numero >= 1 && numero <= 12) {
      return numero;
    }

    const desdeTexto = Number.parseInt(String(valor).replace(/\D/g, ''), 10);
    if (!Number.isNaN(desdeTexto) && desdeTexto >= 1 && desdeTexto <= 12) {
      return desdeTexto;
    }

    return this.hoy.getMonth() + 1;
  }

  private normalizarAnio(valor: string | number): number {
    const numero = Number(valor);
    if (!Number.isNaN(numero) && numero >= 2000) {
      return numero;
    }

    const desdeTexto = Number.parseInt(String(valor).replace(/\D/g, ''), 10);
    if (!Number.isNaN(desdeTexto) && desdeTexto >= 2000) {
      return desdeTexto;
    }

    return this.hoy.getFullYear();
  }

  private formatearFechaInput(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
    const dia = `${fecha.getDate()}`.padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
