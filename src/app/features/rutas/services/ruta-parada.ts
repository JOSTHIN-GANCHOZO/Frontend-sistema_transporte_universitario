import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { RutaParada } from '../models/ruta-parada.model';

export interface ParadaAsignacion {
  id_parada: number;
  orden: number;
}

export interface AsignarParadasPayload {
  id_ruta: number;
  paradas: ParadaAsignacion[];
}

@Service()
export class RutaParadaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ruta-paradas`;

  listarParadasDeRuta(idRuta: number): Observable<RutaParada[]> {
    return this.http.get<RutaParada[]>(`${this.baseUrl}/ruta/${idRuta}`);
  }

  asignarParadas(payload: AsignarParadasPayload): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/asignar`, payload);
  }

  eliminarParadaDeRuta(idRuta: number, idParada: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${idRuta}/${idParada}`);
  }
}
