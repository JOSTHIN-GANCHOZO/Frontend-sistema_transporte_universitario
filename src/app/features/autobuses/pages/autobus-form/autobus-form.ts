import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Autobus, EstadoAutobus } from '../../models/autobus.model';
import { AutobusService } from '../../services/autobus';

@Component({
  selector: 'app-autobus-form',
  imports: [ReactiveFormsModule],
  templateUrl: './autobus-form.html',
  styleUrl: './autobus-form.css',
})
export class AutobusForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly autobusService = inject(AutobusService);

  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly estadoActual = signal('DISPONIBLE');

  readonly form = this.fb.group({
    placa: ['', Validators.required],
    numero_interno: ['', Validators.required],
    marca: [''],
    modelo: [''],
    año: [null as number | null],
    capacidad_maxima: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarAutobus(Number(id));
    }
  }

  private cargarAutobus(id: number): void {
    this.loading.set(true);

    this.autobusService.obtenerPorId(id).subscribe({
      next: (autobus) => {
        this.form.patchValue({
          placa: autobus.placa,
          numero_interno: autobus.numero_interno,
          marca: autobus.marca ?? '',
          modelo: autobus.modelo ?? '',
          año: autobus.año ?? null,
          capacidad_maxima: autobus.capacidad_maxima,
        });
        this.estadoActual.set(autobus.estado ?? 'DISPONIBLE');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el autobús.');
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
    const payload: Partial<Autobus> = {
      placa: datos.placa ?? '',
      numero_interno: datos.numero_interno ?? '',
      marca: datos.marca || undefined,
      modelo: datos.modelo || undefined,
      año: datos.año ?? undefined,
      capacidad_maxima: Number(datos.capacidad_maxima),
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.autobusService.actualizar(id, payload).subscribe({
        next: () => this.router.navigate(['/main/autobuses']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar el autobús.');
        },
      });
      return;
    }

    this.autobusService.crear({ ...payload, estado: 'DISPONIBLE' as EstadoAutobus }).subscribe({
      next: () => this.router.navigate(['/main/autobuses']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear el autobús.');
      },
    });
  }

  estadoBadge(): string {
    switch (this.estadoActual()) {
      case 'DISPONIBLE':
        return 'badge badge-success';
      case 'EN_SERVICIO':
        return 'badge badge-info';
      case 'EN_MANTENIMIENTO':
        return 'badge badge-warning';
      case 'FUERA_DE_SERVICIO':
        return 'badge badge-danger';
      default:
        return 'badge badge-info';
    }
  }

  volver(): void {
    this.router.navigate(['/main/autobuses']);
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
