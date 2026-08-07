import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Parada } from '../../models/parada.model';
import { Ruta } from '../../models/ruta.model';
import { RutaParada } from '../../models/ruta-parada.model';
import { ParadaService } from '../../services/parada';
import { RutaParadaService } from '../../services/ruta-parada';
import { RutaService } from '../../services/ruta';

@Component({
  selector: 'app-ruta-form',
  imports: [ReactiveFormsModule],
  templateUrl: './ruta-form.html',
  styleUrl: './ruta-form.css',
})
export class RutaForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rutaService = inject(RutaService);
  private readonly paradaService = inject(ParadaService);
  private readonly rutaParadaService = inject(RutaParadaService);

  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly paradasDisponibles = signal<Parada[]>([]);
  readonly paradasSeleccionadas = signal<RutaParada[]>([]);
  readonly errorParadas = signal<string | null>(null);

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{1,20}$/i)]],
    nombre: ['', [Validators.required, Validators.pattern(/^[\p{L}\s.'-]+$/u)]],
    origen: ['', [Validators.required, Validators.pattern(/^[\p{L}\p{N}\s.,'-]+$/u)]],
    destino: ['', [Validators.required, Validators.pattern(/^[\p{L}\p{N}\s.,'-]+$/u)]],
    distancia_estimada: [null as number | null, [Validators.min(0), Validators.max(10000)]],
    duracion_aproximada: [''],
  });

  constructor() {
    this.cargarParadasDisponibles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarRuta(Number(id));
      this.cargarParadasDeRuta(Number(id));
    }
  }

  private cargarParadasDisponibles(): void {
    this.paradaService.listar().subscribe({
      next: (paradas) => this.paradasDisponibles.set(paradas),
      error: () => this.error.set('No se pudieron cargar las paradas disponibles.'),
    });
  }

  private cargarParadasDeRuta(id: number): void {
    this.rutaParadaService.listarParadasDeRuta(id).subscribe({
      next: (paradas) => this.paradasSeleccionadas.set(paradas),
      error: () => this.error.set('No se pudieron cargar las paradas de la ruta.'),
    });
  }

  private cargarRuta(id: number): void {
    this.loading.set(true);

    this.rutaService.obtenerPorId(id).subscribe({
      next: (ruta) => {
        this.form.patchValue({
          codigo: ruta.codigo,
          nombre: ruta.nombre,
          origen: ruta.origen,
          destino: ruta.destino,
          distancia_estimada: ruta.distancia_estimada ?? null,
          duracion_aproximada: ruta.duracion_aproximada ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la ruta.');
      },
    });
  }

  paradasParaAgregar(): Parada[] {
    const ids = new Set(this.paradasSeleccionadas().map((p) => p.id_parada));
    return this.paradasDisponibles().filter((parada) => !ids.has(parada.id_parada ?? -1));
  }

  agregarParada(id: number): void {
    const parada = this.paradasDisponibles().find((p) => p.id_parada === id);
    if (!parada || !id) {
      return;
    }

    this.paradasSeleccionadas.update((actuales) => [
      ...actuales,
      { id_ruta: 0, id_parada: id, orden: actuales.length + 1, Parada: parada },
    ]);
    this.errorParadas.set(null);
  }

  agregarParadaDesdeSelect(valor: string): void {
    const id = Number(valor);
    if (id) {
      this.agregarParada(id);
    }
  }

  subirParada(indice: number): void {
    this.paradasSeleccionadas.update((actuales) => {
      if (indice <= 0) {
        return actuales;
      }
      const reordenadas = [...actuales];
      [reordenadas[indice - 1], reordenadas[indice]] = [reordenadas[indice], reordenadas[indice - 1]];
      return this.reordenar(reordenadas);
    });
  }

  bajarParada(indice: number): void {
    this.paradasSeleccionadas.update((actuales) => {
      if (indice >= actuales.length - 1) {
        return actuales;
      }
      const reordenadas = [...actuales];
      [reordenadas[indice], reordenadas[indice + 1]] = [reordenadas[indice + 1], reordenadas[indice]];
      return this.reordenar(reordenadas);
    });
  }

  quitarParada(indice: number): void {
    this.paradasSeleccionadas.update((actuales) => {
      const restantes = actuales.filter((_, i) => i !== indice);
      return this.reordenar(restantes);
    });
  }

  private reordenar(paradas: RutaParada[]): RutaParada[] {
    return paradas.map((parada, indice) => ({ ...parada, orden: indice + 1 }));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.paradasSeleccionadas().length < 2) {
      this.errorParadas.set('Una ruta debe tener al menos 2 paradas (origen y destino).');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.errorParadas.set(null);

    const datos = this.form.getRawValue();
    const payload: Partial<Ruta> = {
      codigo: (datos.codigo ?? '').trim().toUpperCase(),
      nombre: (datos.nombre ?? '').trim(),
      origen: (datos.origen ?? '').trim(),
      destino: (datos.destino ?? '').trim(),
      distancia_estimada: datos.distancia_estimada ? Number(datos.distancia_estimada) : undefined,
      duracion_aproximada: datos.duracion_aproximada || undefined,
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.rutaService.actualizar(id, payload).subscribe({
        next: () => this.asignarParadas(id),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar la ruta.');
        },
      });
      return;
    }

    this.rutaService.crear(payload).subscribe({
      next: (ruta) => this.asignarParadas(ruta.id_ruta ?? 0),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear la ruta.');
      },
    });
  }

  private asignarParadas(idRuta: number): void {
    const paradas = this.paradasSeleccionadas().map((parada) => ({
      id_parada: parada.id_parada,
      orden: parada.orden,
    }));

    this.rutaParadaService.asignarParadas({ id_ruta: idRuta, paradas }).subscribe({
      next: () => this.router.navigate(['/main/rutas']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudieron asignar las paradas a la ruta.');
      },
    });
  }

  volver(): void {
    this.router.navigate(['/main/rutas']);
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  soloCodigo(): void {
    const control = this.form.controls.codigo;
    const valor = control.value?.toString().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20) ?? '';
    control.setValue(valor, { emitEvent: false });
  }

  soloTexto(campo: 'nombre' | 'origen' | 'destino'): void {
    const control = this.form.get(campo);
    if (!control) {
      return;
    }
    const valor = control.value?.toString().replace(/[^\p{L}\p{N}\s.,'-]/gu, '') ?? '';
    control.setValue(valor, { emitEvent: false });
  }
}
