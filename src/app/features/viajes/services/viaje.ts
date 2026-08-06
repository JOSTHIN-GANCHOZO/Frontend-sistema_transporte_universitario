import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { EstadoViaje, Viaje } from '../models/viaje.model';

@Service()
export class ViajeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/viajes`;

  listar(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Viaje> {
    return this.http.get<Viaje>(`${this.baseUrl}/${id}`);
  }

  crear(viaje: Partial<Viaje>): Observable<Viaje> {
    return this.http.post<Viaje>(this.baseUrl, viaje);
  }

  cambiarEstado(id: number, estado: EstadoViaje): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  restaurar(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/restaurar`, {});
  }
}
