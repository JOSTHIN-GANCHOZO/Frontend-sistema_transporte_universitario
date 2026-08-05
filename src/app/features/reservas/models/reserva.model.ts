export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'UTILIZADA' | 'CANCELADA';

export interface Reserva {
  id_reserva?: number;
  fecha?: string;
  numero_asiento: number;
  estado?: EstadoReserva;
  id_usuario?: number;
  id_viaje: number;
}
