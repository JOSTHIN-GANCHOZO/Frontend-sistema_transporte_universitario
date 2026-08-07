import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Parada } from '../../models/parada.model';
import { ParadaService } from '../../services/parada';

@Component({
  selector: 'app-parada-form',
  imports: [ReactiveFormsModule],
  templateUrl: './parada-form.html',
})
export class ParadaForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paradaService = inject(ParadaService);

  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    direccion: [''],
    ubicacion_referencia: [''],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarParada(Number(id));
    }
  }

  private cargarParada(id: number): void {
    this.loading.set(true);

    this.paradaService.obtenerPorId(id).subscribe({
      next: (parada) => {
        this.form.patchValue({
          codigo: parada.codigo,
          nombre: parada.nombre,
          direccion: parada.direccion ?? '',
          ubicacion_referencia: parada.ubicacion_referencia ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la parada.');
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
    const payload: Partial<Parada> = {
      codigo: (datos.codigo ?? '').trim().toUpperCase(),
      nombre: (datos.nombre ?? '').trim(),
      direccion: datos.direccion?.trim() || undefined,
      ubicacion_referencia: datos.ubicacion_referencia?.trim() || undefined,
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.paradaService.actualizar(id, payload).subscribe({
        next: () => this.router.navigate(['/main/paradas']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar la parada.');
        },
      });
      return;
    }

    this.paradaService.crear(payload).subscribe({
      next: () => this.router.navigate(['/main/paradas']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear la parada.');
      },
    });
  }

  volver(): void {
    this.router.navigate(['/main/paradas']);
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
