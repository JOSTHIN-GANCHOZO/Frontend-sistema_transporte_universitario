import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Conductor } from '../models/conductor.model';

@Service()
export class ConductorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/conductores`;

  listar(): Observable<Conductor[]> {
    return this.http.get<Conductor[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Conductor> {
    return this.http.get<Conductor>(`${this.baseUrl}/${id}`);
  }

  crear(conductor: Partial<Conductor>): Observable<Conductor> {
    return this.http.post<Conductor>(this.baseUrl, conductor);
  }

  actualizar(id: number, conductor: Partial<Conductor>): Observable<Conductor> {
    return this.http.put<Conductor>(`${this.baseUrl}/${id}`, conductor);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  restaurar(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/restaurar`, {});
  }
}
