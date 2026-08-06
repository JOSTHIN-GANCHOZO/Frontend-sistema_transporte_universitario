import { Autobus } from '../../autobuses/models/autobus.model';

export type EstadoMantenimiento = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

export interface Mantenimiento {
  id_mantenimiento?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo_mantenimiento?: string;
  descripcion?: string;
  costo?: number;
  estado?: EstadoMantenimiento;
  id_autobus: number;
  Autobus?: Autobus | null;
}

export const ESTADOS_MANTENIMIENTO: EstadoMantenimiento[] = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];
