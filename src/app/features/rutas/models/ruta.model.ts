export interface Ruta {
  id_ruta?: number;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  distancia_estimada?: number;
  duracion_aproximada?: number;
}
