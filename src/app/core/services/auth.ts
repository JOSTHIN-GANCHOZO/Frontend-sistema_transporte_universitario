import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginResponse, Usuario } from '../../features/usuarios/models/usuario.model';

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';
const REQUIERE_CAMBIO_KEY = 'auth_requiere_cambio';

@Service()
export class Auth {
  private readonly http = inject(HttpClient);

  usuarioActual = signal<Usuario | null>(this.leerUsuarioGuardado());

  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { correo, password })
      .pipe(
        tap((respuesta) => {
          localStorage.setItem(TOKEN_KEY, respuesta.token);
          localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
          if (respuesta.requiere_cambio) {
            localStorage.setItem(REQUIERE_CAMBIO_KEY, 'true');
          } else {
            localStorage.removeItem(REQUIERE_CAMBIO_KEY);
          }
          this.usuarioActual.set(respuesta.usuario);
        })
      );
  }

  actualizarPassword(idUsuario: number, password: string): Observable<{ mensaje: string }> {
    return this.http
      .put<{ mensaje: string }>(`${environment.apiUrl}/credenciales/usuario/${idUsuario}/password`, { password })
      .pipe(
        tap(() => {
          localStorage.removeItem(REQUIERE_CAMBIO_KEY);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(REQUIERE_CAMBIO_KEY);
    this.usuarioActual.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  requiereCambio(): boolean {
    return localStorage.getItem(REQUIERE_CAMBIO_KEY) === 'true';
  }

  esAdministrador(): boolean {
    return this.usuarioActual()?.Rol?.nombre === 'ADMINISTRATIVO';
  }

  esAdminPrincipal(): boolean {
    return this.usuarioActual()?.es_admin_principal === true;
  }

  rolActual(): string | null {
    return this.usuarioActual()?.Rol?.nombre ?? null;
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(USUARIO_KEY);
    if (!guardado) {
      return null;
    }
    try {
      return JSON.parse(guardado) as Usuario;
    } catch {
      return null;
    }
  }
}
