import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Ruta } from '../models/ruta.model';

@Service()
export class RutaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rutas`;

  listar(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Ruta> {
    return this.http.get<Ruta>(`${this.baseUrl}/${id}`);
  }

  crear(ruta: Partial<Ruta>): Observable<Ruta> {
    return this.http.post<Ruta>(this.baseUrl, ruta);
  }

  actualizar(id: number, ruta: Partial<Ruta>): Observable<Ruta> {
    return this.http.put<Ruta>(`${this.baseUrl}/${id}`, ruta);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  restaurar(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/restaurar`, {});
  }
}
