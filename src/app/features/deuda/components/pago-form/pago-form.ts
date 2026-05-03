import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { DeudaService } from '../../services/deuda';
import { CuotaDeuda, Deuda } from '../../../../shared/models/deuda.model';

@Component({
  selector: 'app-pago-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago-form.html',
  styleUrl: './pago-form.scss',
})
export class PagoForm implements OnInit {

  @Input({ required: true }) deuda!: Deuda;
  @Output() pagoGuardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  form!: ReturnType<FormBuilder['group']>;

  cuotas: CuotaDeuda[] = [];
  cargandoCuotas = true;
  guardando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
  ) {
    this.form = this.fb.group({
      cuotaId: [null as number | null, Validators.required],
      monto:   [null as number | null, [Validators.required, Validators.min(1)]],
      fechaPago: [new Date().toISOString().substring(0, 10), Validators.required],
    });
  }

  ngOnInit(): void {
    this.deudaService.obtenerCuotas(this.deuda.id).pipe(
      catchError(() => of([])),
      finalize(() => { this.cargandoCuotas = false; })
    ).subscribe((cuotas) => {
      this.cuotas = cuotas.filter((c) => !c.pagada);
    });
  }

  onCuotaChange(): void {
    const id = this.form.value.cuotaId;
    const cuota = this.cuotas.find((c) => c.id === Number(id));
    if (cuota) {
      this.form.patchValue({ monto: cuota.monto });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;
    this.error = null;

    const { cuotaId, monto, fechaPago } = this.form.value;

    this.deudaService.registrarPago(this.deuda.id, {
      cuotaId: cuotaId!,
      monto: monto!,
      fechaPago: fechaPago!,
    }).pipe(
      catchError((err: { message?: string }) => {
        this.error = err?.message || 'Error al registrar el pago.';
        return of(null);
      }),
      finalize(() => { this.guardando = false; })
    ).subscribe((res) => {
      if (res) {
        this.pagoGuardado.emit();
      }
    });
  }

  cancelar(): void {
    this.cancelado.emit();
  }

  esInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c.touched);
  }
}
