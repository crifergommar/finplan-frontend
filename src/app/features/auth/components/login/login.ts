import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  mensajeError = '';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.mensajeError = 'Por favor completa todos los campos correctamente.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mensajeError = err.message || 'Credenciales incorrectas.';
        console.log("Mensaje guardado:", this.mensajeError);
      },
    });
  }
}
