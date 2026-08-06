import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Mantenimiento, EstadoMantenimiento } from '../models/mantenimiento.model';

@Service()
export class MantenimientoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mantenimientos`;

  listar(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Mantenimiento> {
    return this.http.get<Mantenimiento>(`${this.baseUrl}/${id}`);
  }

  crear(mantenimiento: Partial<Mantenimiento>): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.baseUrl, mantenimiento);
  }

  actualizar(id: number, mantenimiento: Partial<Mantenimiento>): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.baseUrl}/${id}`, mantenimiento);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  restaurar(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}/restaurar`, {});
  }
}
