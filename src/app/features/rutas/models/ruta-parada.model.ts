import { Parada } from './parada.model';

export interface RutaParada {
  id_ruta: number;
  id_parada: number;
  orden: number;
  Parada?: Parada | null;
}
