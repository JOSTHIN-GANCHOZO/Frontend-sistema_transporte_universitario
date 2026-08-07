import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Reserva } from '../../../reservas/models/reserva.model';
import { ReservaService } from '../../../reservas/services/reserva';
import { Viaje } from '../../models/viaje.model';
import { ViajeService } from '../../services/viaje';

@Component({
  selector: 'app-viaje-detail',
  imports: [FormsModule],
  templateUrl: './viaje-detail.html',
  styleUrl: './viaje-detail.css',
})
export class ViajeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly viajeService = inject(ViajeService);
  private readonly reservaService = inject(ReservaService);

  readonly viaje = signal<Viaje | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly guardando = signal(false);
  readonly reservaError = signal<string | null>(null);
  readonly reservaCreada = signal<Reserva | null>(null);

  readonly asientoSeleccionado = signal<number | null>(null);
  readonly intentoEnvio = signal(false);

  readonly asientos = computed(() => {
    const max = this.viaje()?.Autobus?.capacidad_maxima ?? 0;
    const ocupados = this.asientosOcupadosLista();
    return Array.from({ length: max }, (_, indice) => {
      const numero = indice + 1;
      return { numero, ocupado: ocupados.includes(numero) };
    });
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
    if (!viaje) {
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

  seleccionarAsiento(numero: number): void {
    const asiento = this.asientos().find((item) => item.numero === numero);
    if (!asiento || asiento.ocupado) {
      return;
    }
    this.asientoSeleccionado.set(this.asientoSeleccionado() === numero ? null : numero);
    this.intentoEnvio.set(false);
  }

  mostrarErrorAsiento(): boolean {
    return this.intentoEnvio() && this.asientoSeleccionado() === null;
  }

  onSubmit(): void {
    const viaje = this.viaje();
    const numeroAsiento = this.asientoSeleccionado();
    if (!viaje?.id_viaje || numeroAsiento === null) {
      this.intentoEnvio.set(true);
      return;
    }

    const idViaje = viaje.id_viaje;
    this.guardando.set(true);
    this.reservaError.set(null);

    this.reservaService
      .crear({
        id_viaje: idViaje,
        numero_asiento: numeroAsiento,
      })
      .subscribe({
        next: (respuesta) => {
          this.guardando.set(false);
          this.reservaCreada.set(respuesta.reserva);
          this.asientoSeleccionado.set(null);
          this.intentoEnvio.set(false);
          this.cargar(idViaje);
        },
        error: (err) => {
          this.guardando.set(false);
          this.reservaError.set(err.error?.mensaje ?? 'No se pudo crear la reserva.');
        },
      });
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