import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Viaje } from '../../models/viaje.model';
import { ViajeService } from '../../services/viaje';
import { Auth } from '../../../../core/services/auth';
import { VerReservasModal } from '../../components/ver-reservas-modal/ver-reservas-modal';

@Component({
  selector: 'app-viaje-list',
  imports: [RouterLink, VerReservasModal],
  templateUrl: './viaje-list.html',
})
export class ViajeList {
  private readonly viajeService = inject(ViajeService);
  private readonly authService = inject(Auth);

  readonly viajes = signal<Viaje[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarModalReservas = signal(false);
  readonly viajeSeleccionadoReservas = signal<Viaje | null>(null);

  constructor() {
    this.cargar();
  }

  esAdministrador(): boolean {
    return this.authService.esAdministrador();
  }

  verReservas(viaje: Viaje): void {
    this.viajeSeleccionadoReservas.set(viaje);
    this.mostrarModalReservas.set(true);
  }

  cerrarModalReservas(): void {
    this.mostrarModalReservas.set(false);
    this.viajeSeleccionadoReservas.set(null);
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
}
