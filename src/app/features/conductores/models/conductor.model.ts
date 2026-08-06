export interface Conductor {
  id_conductor?: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  numero_licencia: string;
  fecha_vencimiento_licencia: string;
}
