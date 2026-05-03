import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { CategoriaService } from '../../../categoria/services/categoria';
import { TransaccionService } from '../../services/transaccion';
import { Categoria } from '../../../../shared/models/categoria.model';
import { CrearTransaccionRequest } from '../../../../shared/models/transaccion.model';

@Component({
  selector: 'app-transaccion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaccion-form.html',
  styleUrl: './transaccion-form.scss',
})
export class TransaccionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly categoriaService = inject(CategoriaService);
  private readonly transaccionService = inject(TransaccionService);

  loading = false;
  error: string | null = null;
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];

  readonly form = this.fb.group({
    tipo: this.fb.nonNullable.control<'GASTO' | 'INGRESO'>('GASTO', { validators: [Validators.required] }),
    categoriaId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    monto: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    fecha: this.fb.nonNullable.control(new Date().toISOString().substring(0, 10), { validators: [Validators.required] }),
    descripcion: this.fb.nonNullable.control('', { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.form.controls.tipo.valueChanges.subscribe(() => this.actualizarCategoriasFiltradas());
    this.cargarCategorias();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const rawValue = this.form.getRawValue();
    const payload: CrearTransaccionRequest = {
      tipo: rawValue.tipo,
      categoriaId: Number(rawValue.categoriaId),
      monto: Number(rawValue.monto),
      fecha: rawValue.fecha,
      descripcion: rawValue.descripcion.trim(),
    };

    this.transaccionService.crear(payload)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err: { error?: { mensaje?: string } } & Error) => {
          this.error = err?.error?.mensaje || err.message || 'Error al guardar';
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  esInvalido(controlName: 'tipo' | 'categoriaId' | 'monto' | 'fecha' | 'descripcion'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private cargarCategorias(): void {
    this.categoriaService.listar()
      .pipe(
        catchError((err: { error?: { mensaje?: string } } & Error) => {
          this.error = err?.error?.mensaje || err.message || 'No fue posible cargar las categorías.';
          return of([]);
        })
      )
      .subscribe((categorias) => {
        this.categorias = categorias;
        this.actualizarCategoriasFiltradas();
      });
  }

  private actualizarCategoriasFiltradas(): void {
    const tipo = this.form.controls.tipo.value;
    this.categoriasFiltradas = this.categorias.filter((categoria) => categoria.tipo === tipo);

    const categoriaActual = this.form.controls.categoriaId.value;
    if (!this.categoriasFiltradas.some((categoria) => categoria.id === categoriaActual)) {
      this.form.controls.categoriaId.setValue(null);
    }
  }
}
