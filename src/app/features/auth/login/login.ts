import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly anio = new Date().getFullYear();
  readonly mostrarPassword = signal(false);

  alternarPassword(): void {
    this.mostrarPassword.update((visible) => !visible);
  }

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { correo, password } = this.form.getRawValue();

    this.auth.login(correo, password).subscribe({
      next: (respuesta) => {
        this.loading.set(false);
        const destino = respuesta.requiere_cambio ? '/cambiar-password' : '/main';
        this.router.navigate([destino]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      },
    });
  }
}
