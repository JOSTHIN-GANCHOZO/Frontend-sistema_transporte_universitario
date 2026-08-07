import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Conductor } from '../../models/conductor.model';
import { ConductorService } from '../../services/conductor';

@Component({
  selector: 'app-conductor-form',
  imports: [ReactiveFormsModule],
  templateUrl: './conductor-form.html',
  styleUrl: './conductor-form.css',
})
export class ConductorForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly conductorService = inject(ConductorService);

  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    identificacion: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    nombres: ['', [Validators.required, Validators.pattern(/^\D+$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^\D+$/)]],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]],
    correo: ['', [Validators.email]],
    numero_licencia: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{1,15}$/i)]],
    fecha_vencimiento_licencia: ['', [Validators.required, fechaFutura]],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarConductor(Number(id));
    }
  }

  private cargarConductor(id: number): void {
    this.loading.set(true);

    this.conductorService.obtenerPorId(id).subscribe({
      next: (conductor) => {
        this.form.patchValue({
          identificacion: conductor.identificacion,
          nombres: conductor.nombres,
          apellidos: conductor.apellidos,
          telefono: conductor.telefono ?? '',
          correo: conductor.correo ?? '',
          numero_licencia: conductor.numero_licencia,
          fecha_vencimiento_licencia: conductor.fecha_vencimiento_licencia,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el conductor.');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const datos = this.form.getRawValue();
    const payload: Partial<Conductor> = {
      identificacion: datos.identificacion ?? '',
      nombres: datos.nombres ?? '',
      apellidos: datos.apellidos ?? '',
      telefono: datos.telefono || undefined,
      correo: datos.correo || undefined,
      numero_licencia: datos.numero_licencia ?? '',
      fecha_vencimiento_licencia: datos.fecha_vencimiento_licencia ?? '',
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.conductorService.actualizar(id, payload).subscribe({
        next: () => this.router.navigate(['/main/conductores']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar el conductor.');
        },
      });
      return;
    }

    this.conductorService.crear(payload).subscribe({
      next: () => this.router.navigate(['/main/conductores']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear el conductor.');
      },
    });
  }

  volver(): void {
    this.router.navigate(['/main/conductores']);
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  soloNumeros(campo: 'identificacion' | 'telefono'): void {
    const control = this.form.get(campo);
    if (!control) {
      return;
    }
    const valor = control.value?.toString().replace(/\D/g, '').slice(0, 10) ?? '';
    control.setValue(valor, { emitEvent: false });
  }

  soloLetras(campo: 'nombres' | 'apellidos'): void {
    const control = this.form.get(campo);
    if (!control) {
      return;
    }
    const valor = control.value?.toString().replace(/[0-9]/g, '') ?? '';
    control.setValue(valor, { emitEvent: false });
  }

  soloLicencia(campo: 'numero_licencia'): void {
    const control = this.form.get(campo);
    if (!control) {
      return;
    }
    const valor =
      control.value?.toString().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 15) ?? '';
    control.setValue(valor, { emitEvent: false });
  }
}

function fechaFutura(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) {
    return null;
  }

  const fecha = new Date(valor + 'T00:00:00');
  if (isNaN(fecha.getTime())) {
    return { fechaInvalida: true };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fecha < hoy ? { fechaFutura: true } : null;
}