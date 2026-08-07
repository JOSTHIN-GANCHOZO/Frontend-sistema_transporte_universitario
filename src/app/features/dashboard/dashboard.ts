import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { Autobus } from '../autobuses/models/autobus.model';
import { AutobusService } from '../autobuses/services/autobus';
import { Conductor } from '../conductores/models/conductor.model';
import { ConductorService } from '../conductores/services/conductor';
import { Mantenimiento } from '../mantenimientos/models/mantenimiento.model';
import { MantenimientoService } from '../mantenimientos/services/mantenimiento';
import { Reserva } from '../reservas/models/reserva.model';
import { ReservaService } from '../reservas/services/reserva';
import { Ruta } from '../rutas/models/ruta.model';
import { RutaService } from '../rutas/services/ruta';
import { Usuario } from '../usuarios/models/usuario.model';
import { UsuarioService } from '../usuarios/services/usuario';
import { Viaje } from '../viajes/models/viaje.model';
import { ViajeService } from '../viajes/services/viaje';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly viajeService = inject(ViajeService);
  private readonly reservaService = inject(ReservaService);
  private readonly autobusService = inject(AutobusService);
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly conductorService = inject(ConductorService);
  private readonly rutaService = inject(RutaService);

  readonly usuario = this.auth.usuarioActual;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly viajes = signal<Viaje[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly autobuses = signal<Autobus[]>([]);
  readonly mantenimientos = signal<Mantenimiento[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly conductores = signal<Conductor[]>([]);
  readonly rutas = signal<Ruta[]>([]);

  readonly fechaHoy = new Date();

  readonly inicial = computed(
    () => (this.auth.usuarioActual()?.nombres?.trim().charAt(0) ?? 'U').toUpperCase(),
  );

  readonly fechaTexto = this.fechaHoy
    .toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^./, (l) => l.toUpperCase());

  readonly viajesActivos = computed(
    () => this.viajes().filter((v) => v.estado === 'EN_RECORRIDO').length,
  );
  readonly viajesProgramados = computed(
    () => this.viajes().filter((v) => v.estado === 'PROGRAMADO').length,
  );
  readonly flotaTotal = computed(() => this.autobuses().length);
  readonly autobusesDisponibles = computed(
    () => this.autobuses().filter((a) => a.estado === 'DISPONIBLE').length,
  );
  readonly autobusesEnServicio = computed(
    () => this.autobuses().filter((a) => a.estado === 'EN_SERVICIO').length,
  );
  readonly autobusesEnMantenimiento = computed(
    () => this.autobuses().filter((a) => a.estado === 'EN_MANTENIMIENTO').length,
  );
  readonly autobusesFuera = computed(
    () => this.autobuses().filter((a) => a.estado === 'FUERA_DE_SERVICIO').length,
  );
  readonly mantenimientosActivos = computed(
    () =>
      this.mantenimientos().filter(
        (m) => m.estado === 'PENDIENTE' || m.estado === 'EN_PROCESO',
      ).length,
  );
  readonly mantenimientosEnCurso = computed(() =>
    this.mantenimientos()
      .filter((m) => m.estado === 'PENDIENTE' || m.estado === 'EN_PROCESO')
      .slice(0, 4),
  );
  readonly usuariosActivos = computed(
    () => this.usuarios().filter((u) => u.Credencial?.estado === 'ACTIVA').length,
  );
  readonly ultimosUsuarios = computed(() =>
    this.usuarios()
      .slice()
      .sort((a, b) => (b.id_usuario ?? 0) - (a.id_usuario ?? 0))
      .slice(0, 4),
  );
  readonly reservasConfirmadas = computed(
    () => this.reservas().filter((r) => r.estado === 'CONFIRMADA').length,
  );
  readonly reservasUtilizadas = computed(
    () => this.reservas().filter((r) => r.estado === 'UTILIZADA').length,
  );
  readonly totalRutas = computed(() => this.rutas().length);
  readonly totalConductores = computed(() => this.conductores().length);

  readonly viajesProximos = computed(() =>
    this.viajes()
      .filter((v) => v.estado === 'PROGRAMADO' || v.estado === 'EN_RECORRIDO')
      .sort((a, b) => this.fechaHoraViaje(a).localeCompare(this.fechaHoraViaje(b)))
      .slice(0, 4),
  );

  readonly viajesDisponibles = computed(() =>
    this.viajes()
      .filter((v) => v.estado === 'PROGRAMADO' && (v.cupos_disponibles ?? 0) > 0)
      .sort((a, b) => this.fechaHoraViaje(a).localeCompare(this.fechaHoraViaje(b)))
      .slice(0, 4),
  );

  readonly totalMisReservas = computed(() => this.reservas().length);

  readonly proximaSalida = computed(() => {
    const programados = this.viajes()
      .filter((v) => v.estado === 'PROGRAMADO')
      .sort((a, b) => this.fechaHoraViaje(a).localeCompare(this.fechaHoraViaje(b)));
    return programados[0] ?? null;
  });

  readonly misReservasProximas = computed(() =>
    this.reservas()
      .filter((r) => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA')
      .filter((r) => r.Viaje && this.fechaHoraViaje(r.Viaje) >= this.hoyISO())
      .sort((a, b) =>
        this.fechaHoraViaje(a.Viaje ?? ({ fecha: '', hora_salida: '' } as Viaje)).localeCompare(
          this.fechaHoraViaje(b.Viaje ?? ({ fecha: '', hora_salida: '' } as Viaje)),
        ),
      )
      .slice(0, 4),
  );

  esAdministrador(): boolean {
    return this.auth.esAdministrador();
  }

  esAdminPrincipal(): boolean {
    return this.auth.esAdminPrincipal();
  }

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    const solicitudes = this.esAdministrador()
      ? [
          this.viajeService.listar(),
          this.reservaService.listar(),
          this.autobusService.listar(),
          this.mantenimientoService.listar(),
          this.usuarioService.obtenerUsuarios(),
          this.conductorService.listar(),
          this.rutaService.listar(),
        ]
      : [this.viajeService.listar(), this.reservaService.listar()];

    forkJoin(solicitudes).subscribe({
      next: (datos) => {
        this.viajes.set(datos[0] as Viaje[]);
        this.reservas.set(datos[1] as Reserva[]);
        if (this.esAdministrador()) {
          this.autobuses.set(datos[2] as Autobus[]);
          this.mantenimientos.set(datos[3] as Mantenimiento[]);
          this.usuarios.set(datos[4] as Usuario[]);
          this.conductores.set(datos[5] as Conductor[]);
          this.rutas.set(datos[6] as Ruta[]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el resumen del panel.');
      },
    });
  }

  flotaBarras(): { estado: string; etiqueta: string; valor: number; clase: string }[] {
    const total = this.flotaTotal();
    if (total === 0) {
      return [];
    }
    return [
      {
        estado: 'DISPONIBLE',
        etiqueta: 'Disponibles',
        valor: this.autobusesDisponibles(),
        clase: 'success',
      },
      {
        estado: 'EN_SERVICIO',
        etiqueta: 'En servicio',
        valor: this.autobusesEnServicio(),
        clase: 'primary',
      },
      {
        estado: 'EN_MANTENIMIENTO',
        etiqueta: 'En mantenimiento',
        valor: this.autobusesEnMantenimiento(),
        clase: 'info',
      },
      {
        estado: 'FUERA_DE_SERVICIO',
        etiqueta: 'Fuera de servicio',
        valor: this.autobusesFuera(),
        clase: 'danger',
      },
    ];
  }

  porcentajeFlota(valor: number): number {
    const total = this.flotaTotal();
    return total === 0 ? 0 : Math.round((valor / total) * 100);
  }

  nombreRuta(viaje: Viaje): string {
    return viaje.Ruta?.nombre ?? viaje.Ruta?.codigo ?? `Ruta #${viaje.id_ruta}`;
  }

  nombreRutaDeReserva(reserva: Reserva): string {
    const viaje = reserva.Viaje ?? ({ Ruta: null, fecha: '', hora_salida: '' } as Viaje);
    return viaje.Ruta?.nombre ?? this.rutaOrigenDestino(viaje);
  }

  rutaOrigenDestino(viaje: Viaje): string {
    const ruta = viaje.Ruta;
    if (ruta?.origen && ruta?.destino) {
      return `${ruta.origen} → ${ruta.destino}`;
    }
    return this.nombreRuta(viaje);
  }

  nombreAutobus(viaje: Viaje): string {
    return viaje.Autobus?.placa ?? `Autobús #${viaje.id_autobus}`;
  }

  horaSalida(hora?: string): string {
    if (!hora) {
      return '—';
    }
    return hora.length > 5 ? hora.slice(0, 5) : hora;
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

  estadoReservaBadge(estado?: string): string {
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

  estacionamientoBadge(estado?: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge badge-warning';
      case 'EN_PROCESO':
        return 'badge badge-info';
      default:
        return 'badge badge-info';
    }
  }

  nombreAutobusDeMantenimiento(mantenimiento: Mantenimiento): string {
    return mantenimiento.Autobus?.placa ?? `Autobús #${mantenimiento.id_autobus}`;
  }

  nombreUsuario(usuario: Usuario): string {
    return `${usuario.nombres} ${usuario.apellidos ?? ''}`.trim();
  }

  rolUsuario(usuario: Usuario): string {
    return usuario.Rol?.nombre ?? usuario.tipo_usuario ?? '—';
  }

  inicialUsuario(usuario: Usuario): string {
    return (usuario.nombres?.trim().charAt(0) ?? 'U').toUpperCase();
  }

  fechaCorta(fecha?: string): string {
    if (!fecha) {
      return '—';
    }
    return fecha;
  }

  private hoyISO(): string {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${ahora.getFullYear()}-${mes}-${dia}`;
  }

  private fechaHoraViaje(viaje: Viaje): string {
    const hora =
      viaje.hora_salida && viaje.hora_salida.length > 5
        ? viaje.hora_salida.slice(0, 5)
        : viaje.hora_salida ?? '00:00';
    return `${viaje.fecha ?? ''}T${hora}`;
  }
}