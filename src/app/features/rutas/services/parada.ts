import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Parada } from '../models/parada.model';

@Service()
export class ParadaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/paradas`;

  listar(): Observable<Parada[]> {
    return this.http.get<Parada[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Parada> {
    return this.http.get<Parada>(`${this.baseUrl}/${id}`);
  }

  crear(parada: Partial<Parada>): Observable<Parada> {
    return this.http.post<Parada>(this.baseUrl, parada);
  }

  actualizar(id: number, parada: Partial<Parada>): Observable<Parada> {
    return this.http.put<Parada>(`${this.baseUrl}/${id}`, parada);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  restaurar(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/restaurar`, {});
  }
}
