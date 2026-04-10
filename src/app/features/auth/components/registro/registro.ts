import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegistroRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  form: FormGroup;
  errorMsg = '';
  successMsg = '';
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    const datos: RegistroRequest = this.form.value;
    this.authService.registro(datos).subscribe({
      next: (resp) => {
        this.successMsg = resp.mensaje || 'Cuenta creada exitosamente.';
        this.cargando = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: Error) => {
        this.errorMsg = err.message || 'Error al crear la cuenta.';
        this.cargando = false;
      },
    });
  }
}
