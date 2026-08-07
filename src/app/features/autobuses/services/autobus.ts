import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Autobus } from '../models/autobus.model';

@Service()
export class AutobusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/autobuses`;

  listar(): Observable<Autobus[]> {
    return this.http.get<Autobus[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Autobus> {
    return this.http.get<Autobus>(`${this.baseUrl}/${id}`);
  }

  crear(autobus: Partial<Autobus>): Observable<Autobus> {
    return this.http.post<Autobus>(this.baseUrl, autobus);
  }

  actualizar(id: number, autobus: Partial<Autobus>): Observable<Autobus> {
    return this.http.put<Autobus>(`${this.baseUrl}/${id}`, autobus);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  restaurar(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/restaurar`, {});
  }
}
