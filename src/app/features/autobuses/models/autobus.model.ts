export type EstadoAutobus = 'DISPONIBLE' | 'EN_SERVICIO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO';

export interface Autobus {
  id_autobus?: number;
  placa: string;
  numero_interno: string;
  marca?: string;
  modelo?: string;
  año?: number;
  capacidad_maxima: number;
  estado?: EstadoAutobus;
}

export const ESTADOS_AUTOBUS: EstadoAutobus[] = [
  'DISPONIBLE',
  'EN_SERVICIO',
  'EN_MANTENIMIENTO',
  'FUERA_DE_SERVICIO',
];
