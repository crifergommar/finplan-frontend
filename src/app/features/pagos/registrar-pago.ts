import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { DeudaService } from '../deuda/services/deuda';
import { Deuda, CuotaDeuda, PagoRequest } from '../../shared/models/deuda.model';

@Component({
  selector: 'app-registrar-pago',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-pago.html',
  styleUrl: './registrar-pago.scss',
})
export class RegistrarPago implements OnInit {

  /* ── Datos ── */
  deudas: Deuda[] = [];
  cuotas: CuotaDeuda[] = [];

  /* ── Estado UI ── */
  loading      = false;
  cargandoCuotas = false;
  enviando     = false;
  error: string | null = null;
  exito        = false;
  metodoActivo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' = 'EFECTIVO';

  /* ── Formulario ── */
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
  ) {
    this.form = this.fb.group({
      deudaId:   [null as number | null, Validators.required],
      cuotaId:   [null as number | null, Validators.required],
      monto:     [null as number | null, [Validators.required, Validators.min(1)]],
      fechaPago: [new Date().toISOString().substring(0, 10), Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarDeudas();
  }

  cargarDeudas(): void {
    this.loading = true;
    this.error   = null;

    this.deudaService.listar().pipe(
      finalize(() => { this.loading = false; }),
    ).subscribe({
      next:  (data) => { this.deudas = data; },
      error: () => { this.error = 'No se pudieron cargar las deudas activas.'; },
    });
  }

  onDeudaChange(): void {
    const deudaId = Number(this.form.value.deudaId);
    if (!deudaId) return;

    this.form.patchValue({ cuotaId: null, monto: null });
    this.cuotas = [];
    this.cargandoCuotas = true;

    this.deudaService.obtenerCuotas(deudaId).pipe(
      finalize(() => { this.cargandoCuotas = false; }),
      catchError(() => of([] as CuotaDeuda[])),
    ).subscribe((cuotas) => {
      this.cuotas = cuotas.filter((c) => !c.pagada);
      // Pre-selecciona la primera cuota pendiente
      if (this.cuotas.length > 0) {
        this.form.patchValue({
          cuotaId: this.cuotas[0].id,
          monto:   this.cuotas[0].monto,
        });
      }
    });
  }

  onCuotaChange(): void {
    const cuotaId = Number(this.form.value.cuotaId);
    const cuota = this.cuotas.find((c) => c.id === cuotaId);
    if (cuota) {
      this.form.patchValue({ monto: cuota.monto });
    }
  }

  seleccionarMetodo(metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'): void {
    this.metodoActivo = metodo;
  }

  guardar(): void {
    if (this.form.invalid || this.enviando) return;

    const deudaId = Number(this.form.value.deudaId);
    const payload: PagoRequest = {
      cuotaId:   this.form.value.cuotaId!,
      monto:     this.form.value.monto!,
      fechaPago: this.form.value.fechaPago!,
    };

    this.enviando = true;
    this.error    = null;
    this.exito    = false;

    this.deudaService.registrarPago(deudaId, payload).pipe(
      finalize(() => { this.enviando = false; }),
      catchError((err) => {
        this.error = err?.error?.mensaje || 'No se pudo registrar el pago.';
        return of(null);
      }),
    ).subscribe((res) => {
      if (res) {
        this.exito = true;
        this.form.reset({
          fechaPago: new Date().toISOString().substring(0, 10),
        });
        this.cuotas = [];
        this.metodoActivo = 'EFECTIVO';
        // Recarga deudas para reflejar el nuevo estado
        this.cargarDeudas();
      }
    });
  }

  cancelar(): void {
    this.form.reset({ fechaPago: new Date().toISOString().substring(0, 10) });
    this.cuotas = [];
    this.error  = null;
    this.exito  = false;
  }

  esInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c.touched);
  }
}
