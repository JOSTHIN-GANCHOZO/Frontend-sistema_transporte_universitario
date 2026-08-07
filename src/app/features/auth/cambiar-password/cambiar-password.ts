import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth';

const MIN_CARACTERES = 8;
const MIN_NUMEROS = 2;

export function validarPasswordFuerte(control: FormControl): ValidationErrors | null {
  const valor = (control.value as string) ?? '';
  if (!valor) {
    return null;
  }

  const errores: ValidationErrors = {};
  if (valor.length < MIN_CARACTERES) {
    errores['longitudMinima'] = true;
  }
  if ((valor.match(/\d/g) ?? []).length < MIN_NUMEROS) {
    errores['numerosMinimos'] = true;
  }
  if (!valor.includes('.')) {
    errores['puntoRequerido'] = true;
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

@Component({
  selector: 'app-cambiar-password',
  imports: [ReactiveFormsModule],
  templateUrl: './cambiar-password.html',
  styleUrl: '../login/login.css',
})
export class CambiarPassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly anio = new Date().getFullYear();
  readonly mostrarPassword = signal(false);

  readonly usuarioActual = this.auth.usuarioActual;

  alternarPassword(): void {
    this.mostrarPassword.update((visible) => !visible);
  }

  longitud(): number {
    return (this.form.controls.password.value ?? '').length;
  }

  cantidadNumeros(): number {
    return (this.form.controls.password.value.match(/\d/g) ?? []).length;
  }

  tienePunto(): boolean {
    return this.form.controls.password.value.includes('.') ?? false;
  }

  readonly passwordIgual = (): { passwordIncorrecta: boolean } | null => {
    const password = this.form?.get('password')?.value;
    const confirmacion = this.form?.get('confirmacion')?.value;
    return password !== confirmacion ? { passwordIncorrecta: true } : null;
  };

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, validarPasswordFuerte]],
      confirmacion: ['', Validators.required],
    },
    { validators: this.passwordIgual }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idUsuario = this.usuarioActual()?.id_usuario;
    if (!idUsuario) {
      this.error.set('La sesión no es válida. Vuelve a iniciar sesión.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { password } = this.form.getRawValue();

    this.auth.actualizarPassword(idUsuario, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        this.mostrarPassword.set(false);
        this.router.navigate(['/main']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo actualizar la contraseña. Inténtalo de nuevo.');
      },
    });
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}