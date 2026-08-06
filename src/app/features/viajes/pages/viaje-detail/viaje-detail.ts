import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Auth } from '../../../../core/services/auth';
import { Reserva } from '../../../reservas/models/reserva.model';
import { ReservaService } from '../../../reservas/services/reserva';
import { Viaje } from '../../models/viaje.model';
import { ViajeService } from '../../services/viaje';

@Component({
  selector: 'app-viaje-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './viaje-detail.html',
  styleUrl: './viaje-detail.css',
})
export class ViajeDetail {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly viajeService = inject(ViajeService);
  private readonly reservaService = inject(ReservaService);
  private readonly auth = inject(Auth);

  readonly viaje = signal<Viaje | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly guardando = signal(false);
  readonly reservaError = signal<string | null>(null);
  readonly reservaCreada = signal<Reserva | null>(null);

  readonly form = this.fb.group({
    numero_asiento: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(Number(id))) {
      this.error.set('El identificador del viaje no es válido.');
      this.loading.set(false);
      return;
    }
    this.cargar(Number(id));
  }

  private cargar(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.viajeService.obtenerPorId(id).subscribe({
      next: (viaje) => {
        this.viaje.set(viaje);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el detalle del viaje.');
      },
    });
  }

  puedeReservar(): boolean {
    const viaje = this.viaje();
    if (!viaje || this.auth.esAdministrador()) {
      return false;
    }
    return viaje.estado === 'PROGRAMADO' && (viaje.cupos_disponibles ?? 0) > 0;
  }

  asientosOcupados(): number {
    return this.asientosOcupadosLista().length;
  }

  asientosOcupadosLista(): number[] {
    return (this.viaje()?.Reservas ?? [])
      .filter((reserva) => reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA')
      .map((reserva) => reserva.numero_asiento)
      .sort((a, b) => a - b);
  }

  onSubmit(): void {
    const viaje = this.viaje();
    if (!viaje?.id_viaje || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idViaje = viaje.id_viaje;
    this.guardando.set(true);
    this.reservaError.set(null);

    this.reservaService
      .crear({
        id_viaje: idViaje,
        numero_asiento: Number(this.form.controls.numero_asiento.value) || 1,
      })
      .subscribe({
        next: (respuesta) => {
          this.guardando.set(false);
          this.reservaCreada.set(respuesta.reserva);
          this.form.controls.numero_asiento.setValue(1);
          this.cargar(idViaje);
        },
        error: (err) => {
          this.guardando.set(false);
          this.reservaError.set(err.error?.mensaje ?? 'No se pudo crear la reserva.');
        },
      });
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  nombreRuta(viaje: Viaje): string {
    return viaje.Ruta?.nombre ?? viaje.Ruta?.codigo ?? `Ruta #${viaje.id_ruta}`;
  }

  nombreAutobus(viaje: Viaje): string {
    return viaje.Autobus?.placa ?? `Autobús #${viaje.id_autobus}`;
  }

  nombreConductor(viaje: Viaje): string {
    const conductor = viaje.Conductor;
    if (conductor?.nombres) {
      return `${conductor.nombres} ${conductor.apellidos ?? ''}`.trim();
    }
    return `Conductor #${viaje.id_conductor}`;
  }

  horaSalida(hora?: string): string {
    if (!hora) {
      return '—';
    }
    return hora.length > 5 ? hora.slice(0, 5) : hora;
  }

  fechaFormateada(fecha?: string): string {
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '—';
  }

  estadoBadge(estado?: string): string {
    switch (estado) {
      case 'PROGRAMADO':
        return 'badge badge-info';
      case 'EN_RECORRIDO':
        return 'badge badge-warning';
      case 'FINALIZADO':
        return 'badge badge-success';
      case 'CANCELADO':
        return 'badge badge-danger';
      default:
        return 'badge badge-info';
    }
  }

  volver(): void {
    this.router.navigate(['/main/viajes']);
  }

  irMisReservas(): void {
    this.router.navigate(['/main/reservas']);
  }
}