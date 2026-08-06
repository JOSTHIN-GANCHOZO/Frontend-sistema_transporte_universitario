import { Component, inject, signal } from '@angular/core';

import { Auth } from '../../../../core/services/auth';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Reserva } from '../../models/reserva.model';
import { ReservaService } from '../../services/reserva';

@Component({
  selector: 'app-reserva-list',
  imports: [ConfirmDialog],
  templateUrl: './reserva-list.html',
})
export class ReservaList {
  private readonly reservaService = inject(ReservaService);
  protected readonly auth = inject(Auth);

  readonly reservas = signal<Reserva[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly reservaACancelar = signal<Reserva | null>(null);
  readonly cancelando = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reservaService.listar().subscribe({
      next: (reservas) => {
        this.reservas.set(reservas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las reservas.');
      },
    });
  }

  pedirCancelar(reserva: Reserva): void {
    this.reservaACancelar.set(reserva);
    this.dialogoVisible.set(true);
  }

  cancelarDialogo(): void {
    this.dialogoVisible.set(false);
    this.reservaACancelar.set(null);
  }

  confirmarCancelacion(): void {
    const reserva = this.reservaACancelar();
    if (!reserva?.id_reserva) {
      return;
    }

    this.cancelando.set(true);

    this.reservaService.cancelar(reserva.id_reserva).subscribe({
      next: () => {
        this.cancelando.set(false);
        this.dialogoVisible.set(false);
        this.reservaACancelar.set(null);
        this.cargar();
      },
      error: () => {
        this.cancelando.set(false);
        this.error.set('No se pudo cancelar la reserva.');
      },
    });
  }

  puedeCancelar(reserva: Reserva): boolean {
    return reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA';
  }

  estadoBadge(estado?: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'badge badge-success';
      case 'PENDIENTE':
        return 'badge badge-warning';
      case 'UTILIZADA':
        return 'badge badge-info';
      case 'CANCELADA':
        return 'badge badge-danger';
      default:
        return 'badge badge-info';
    }
  }

  nombreViaje(reserva: Reserva): string {
    const viaje = reserva.Viaje;
    const fecha = viaje?.fecha ? new Date(viaje.fecha).toLocaleDateString('es-ES') : '';
    const hora = viaje?.hora_salida ? (viaje.hora_salida.length > 5 ? viaje.hora_salida.slice(0, 5) : viaje.hora_salida) : '';
    return `Viaje #${viaje?.id_viaje ?? reserva.id_viaje}${fecha ? ` · ${fecha}` : ''}${hora ? ` ${hora}` : ''}`;
  }

  fechaReserva(fecha?: string): string {
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '—';
  }
}
