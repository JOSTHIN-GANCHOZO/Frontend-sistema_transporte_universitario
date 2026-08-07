import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../../../../core/services/auth';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Viaje } from '../../models/viaje.model';
import { ViajeService } from '../../services/viaje';

@Component({
  selector: 'app-viaje-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './viaje-list.html',
})
export class ViajeList {
  private readonly auth = inject(Auth);
  private readonly viajeService = inject(ViajeService);

  readonly viajes = signal<Viaje[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly viajeAEliminar = signal<Viaje | null>(null);
  readonly eliminando = signal(false);

  esAdminPrincipal(): boolean {
    return this.auth.esAdminPrincipal();
  }

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.viajeService.listar().subscribe({
      next: (viajes) => {
        this.viajes.set(viajes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los viajes.');
      },
    });
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

  pedirEliminar(viaje: Viaje): void {
    this.viajeAEliminar.set(viaje);
    this.dialogoVisible.set(true);
  }

  cancelarEliminacion(): void {
    this.dialogoVisible.set(false);
    this.viajeAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const viaje = this.viajeAEliminar();
    if (!viaje) {
      return;
    }

    this.eliminando.set(true);

    this.viajeService.eliminar(viaje.id_viaje ?? 0).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.dialogoVisible.set(false);
        this.viajeAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar el viaje.');
      },
    });
  }
}