import { Autobus } from '../../autobuses/models/autobus.model';
import { Conductor } from '../../conductores/models/conductor.model';
import { Reserva } from '../../reservas/models/reserva.model';
import { Ruta } from '../../rutas/models/ruta.model';

export type EstadoViaje = 'PROGRAMADO' | 'EN_RECORRIDO' | 'FINALIZADO' | 'CANCELADO';

export interface Viaje {
  id_viaje?: number;
  fecha: string;
  hora_salida: string;
  hora_llegada_estimada?: string;
  id_ruta: number;
  id_autobus: number;
  id_conductor: number;
  estado?: EstadoViaje;
  cupos_disponibles?: number;
  Ruta?: Ruta | null;
  Autobus?: Autobus | null;
  Conductor?: Conductor | null;
  Reservas?: Reserva[];
}

export const ESTADOS_VIAJE: EstadoViaje[] = ['PROGRAMADO', 'EN_RECORRIDO', 'FINALIZADO', 'CANCELADO'];
