import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Viaje } from '../../../viajes/models/viaje.model';
import { ViajeService } from '../../../viajes/services/viaje';
import { ReservaService } from '../../services/reserva';

@Component({
  selector: 'app-reserva-form',
  imports: [ReactiveFormsModule],
  templateUrl: './reserva-form.html',
})
export class ReservaForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservaService = inject(ReservaService);
  private readonly viajeService = inject(ViajeService);

  readonly viajes = signal<Viaje[]>([]);
  readonly cargandoViajes = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly creada = signal(false);

  readonly form = this.fb.group({
    id_viaje: [null as number | null, Validators.required],
    numero_asiento: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    const idViaje = this.route.snapshot.queryParamMap.get('id_viaje');
    if (idViaje && !isNaN(Number(idViaje))) {
      this.form.controls.id_viaje.setValue(Number(idViaje));
    }
    this.cargarViajes();
  }

  private cargarViajes(): void {
    this.viajeService.listar().subscribe({
      next: (viajes) => {
        this.viajes.set(viajes.filter((viaje) => viaje.estado === 'PROGRAMADO'));
        this.cargandoViajes.set(false);
      },
      error: () => {
        this.cargandoViajes.set(false);
        this.error.set('No se pudieron cargar los viajes.');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const datos = this.form.getRawValue();

    this.reservaService
      .crear({
        id_viaje: Number(datos.id_viaje),
        numero_asiento: Number(datos.numero_asiento),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.creada.set(true);
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo crear la reserva.');
        },
      });
  }

  nombreViaje(viaje: Viaje): string {
    const ruta = viaje.Ruta?.nombre ?? viaje.Ruta?.codigo ?? `Ruta #${viaje.id_ruta}`;
    const fecha = viaje.fecha ? new Date(viaje.fecha).toLocaleDateString('es-ES') : '';
    let hora = viaje.hora_salida ?? '';
    if (hora.length > 5) {
      hora = hora.slice(0, 5);
    }
    return `#${viaje.id_viaje} · ${ruta} · ${fecha} ${hora} · Cupos: ${viaje.cupos_disponibles ?? '—'}`;
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  volver(): void {
    this.router.navigate(['/main/reservas']);
  }
}